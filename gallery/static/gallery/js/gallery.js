var pictures = null; // Получим от сервера и сохраним все ссылки на картинки
var placeholder = null;

function getCookie(name) {
    var matches = document.cookie.match(new RegExp(
        "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
    ));
    return matches ? decodeURIComponent(matches[1]) : undefined;
}

function setCookie(name, value, options) {
    options = options || {};

    var expires = options.expires;

    if (typeof expires == "number" && expires) {
        var d = new Date();
        d.setTime(d.getTime() + expires * 1000);
        expires = options.expires = d;
    }
    if (expires && expires.toUTCString) {
        options.expires = expires.toUTCString();
    }

    value = encodeURIComponent(value);

    var updatedCookie = name + "=" + value;

    for (var propName in options) {
        updatedCookie += "; " + propName;
        var propValue = options[propName];
        if (propValue !== true) {
            updatedCookie += "=" + propValue;
        }
    }

    document.cookie = updatedCookie;
}

function deleteCookie(name) {
    setCookie(name, "", {
        expires: -1
    })
}


function domReady() {
    console.log("Dom ready");

    window.addEventListener("keyup", kp);
    window.addEventListener('hashchange', hashChanged);

    var xhr = new XMLHttpRequest();
    xhr.open('GET', '/gallery/pictures/', false);
    xhr.send();
    if (xhr.status != 200) {
        console.log('Error in query', xhr.statusText);
    } else {
        pictures = JSON.parse(xhr.responseText);
        console.log(pictures);
    }

    // Проверим, есть ли картинка в куках
    if (getCookie('picId')) {
        window.location.hash = getCookie('picId');
        hashChanged();
    }

    placeholder = document.getElementById('bigpic').src;

    // Проверим, есть ли любимая фотография
    var topImg = getCookie('topImg');
    if (topImg) {
        if (pictures[topImg]) {
            setFavImage(pictures[topImg]);
        }
    } else {
        unsetFavImage();
    }
}

function hashChanged() {
    console.log('Hash changed');
    var hash = parseInt(window.location.hash.substring(1), 10);
    console.log(hash);
    if (pictures[hash.toString()]) {
        genFullPic(pictures[hash]);
    }
}

function genFullPic(pic) {
    var previewPic = pic[0];
    var fullPic = pic[1];
    var hash = parseInt(window.location.hash.substring(1), 10);
    console.log(previewPic, fullPic);

    var modal = document.getElementById('modal');
    var bigPic = document.getElementById('bigpic');

    // Предзагрузка фотографии
    var downloadingImage = new Image();
    downloadingImage.onload = function() {
        bigPic.src = this.src;
    };
    downloadingImage.src = fullPic;

    // Предзагрузка соседних фотографий
    if (pictures[hash + 1]) {
        var nextImg = new Image();
        nextImg.src = pictures[hash + 1][1];
    }
    if (pictures[hash - 1]) {
        var prevImg = new Image();
        prevImg.src = pictures[hash - 1][1];
    }

    // Добавляем комментарии
    var modalContent = document.getElementById('modal-content');
    var uiComments = document.createElement('div');
    uiComments.setAttribute('class', 'ui comments');
    var comments = getComments(hash.toString());
    if (comments['is_auth'] === "1") {
        // Отображаем все комментарии
        modalContent.appendChild(uiComments);
        for (var comment in comments['comments']) {
            var realComment = comments['comments'][comment];
            //console.log(realComment);
            uiComments.appendChild(drawComment(realComment));
        }
        // Отображаем форму для отправки
        modalContent.appendChild(drawReplyForm());
        // Отправляем сообщение на сервер
        document.getElementById('post-button').addEventListener('click', function(event){
            event.preventDefault();
            var new_post = JSON.stringify({
                picId: hash,
                comment: document.getElementById('comment-body').value
            });
            var xhr = new XMLHttpRequest();
            xhr.open('POST', '/gallery/addcomment/', true);
            xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8');
            xhr.setRequestHeader('X-CSRFToken', getCookie('csrftoken'));
            xhr.send(new_post);
            xhr.onreadystatechange = function() {
                if (xhr.readyState != 4) return;
                if (xhr.status != 200) {
                    console.log('Error in query', xhr.statusText);
                } else {
                    var ans = JSON.parse(xhr.responseText);
                    console.log(ans);
                    uiComments.appendChild(drawComment(ans));
                    document.getElementById('comment-body').value = ''
                }
            };
        });
    } else {
        var authDiv = document.createElement('div');
        authDiv.setAttribute('class', 'ui message red');
        var regLinkDiv = document.createElement('a');
        regLinkDiv.setAttribute('href', '/accounts/login');
        regLinkDiv.innerHTML = 'Необходимо войти для просмотра и комментирования';
        authDiv.appendChild(regLinkDiv);
        modalContent.appendChild(authDiv);
    }

    // Показ модального окна
    // Скрытие модального окна
    $('.long.modal')
        .modal('show')
        .modal({
            onHidden : function () {
                clearModal();
                deleteCookie('picId');
                window.location.hash = '';
            }
        })
    ;

    // Запомним картинку в куки
    setCookie('picId', hash, {'expires': 99999});
}

// Приводим модальное окно к начальному состоянию
function clearModal(){
    var modalContent = document.getElementById('modal-content');
    modalContent.innerHTML = '';
    document.getElementById('bigpic').src = placeholder;
    modal.setAttribute('class', 'ui long modal');
}

// Получаем комментарии от сервера
function getComments(hash){
    var comments = null;
    var xhr = new XMLHttpRequest();
    xhr.open('GET', '/gallery/comments/' + hash, false);
    xhr.send();
    if (xhr.status != 200) {
        console.log('Error in query', xhr.statusText);
    } else {
        var ans = JSON.parse(xhr.responseText);
        comments = JSON.parse(xhr.responseText);
        console.log(comments);
        return comments;
    }
}

// Отображаем комментарий
function drawComment(comment) {
    var commentDiv = document.createElement('div');
    commentDiv.setAttribute('class', 'comment');
    var contentDiv = document.createElement('div');
    contentDiv.setAttribute('class', 'content');
    var authorDiv = document.createElement('a');
    authorDiv.setAttribute('class', 'author');
    var textDiv = document.createElement('div');
    textDiv.setAttribute('class', 'text');

    authorDiv.innerHTML = comment['author'];
    textDiv.innerHTML = comment['text'];

    commentDiv.appendChild(contentDiv);
    contentDiv.appendChild(authorDiv);
    contentDiv.appendChild(textDiv);

    return commentDiv;
}

function drawReplyForm() {
    var replyFormDiv = document.createElement('form');
    replyFormDiv.setAttribute('class', 'ui reply form');
    replyFormDiv.setAttribute('id', 'reply-form');
    var fieldDiv = document.createElement('div');
    fieldDiv.setAttribute('class', 'field');
    var textArea = document.createElement('textarea');
    textArea.setAttribute('id', 'comment-body')
    var subButton = document.createElement('div');
    subButton.setAttribute('class', 'ui blue labeled submit icon button');
    subButton.setAttribute('id', 'post-button');

    replyFormDiv.appendChild(fieldDiv);
    fieldDiv.appendChild(textArea);
    replyFormDiv.appendChild(subButton);
    subButton.innerHTML = '<i class="icon edit"></i> Запостить';

    return replyFormDiv;
}

function showPrev() {
    var hash = parseInt(window.location.hash.substring(1), 10);
    if (pictures[hash - 1]) {
        clearModal();
        deleteCookie('picId');
        window.location.hash = (hash - 1).toString();
    }
}

function showNext() {
    var hash = parseInt(window.location.hash.substring(1), 10);
    if (pictures[hash + 1]) {
        clearModal();
        deleteCookie('picId');
        window.location.hash = (hash + 1).toString();
    }
}

function setFavImage(pic) {
    var img = document.getElementById('fav-img');
    img.setAttribute('src', pic[1]);
    var topImg = document.getElementById('fav-img-div');
    topImg.setAttribute('style', 'display:block');
}

function setFavImageHandler(pic) {
    var hash = parseInt(window.location.hash.substring(1), 10);
    setCookie('topImg', hash, {'expires': 9999});
    setFavImage(pictures[hash])
}

function unsetFavImage() {
    deleteCookie('topImg');
    var topImg = document.getElementById('fav-img-div');
    topImg.setAttribute('style', 'display:none');
}

function kp(e) {
    console.log(e);
    var code = e.keyCode || e.which;
    if (code === 27) {
        console.log("escape key-up pressed");
        $('.long.modal')
            .modal('hide')
        ;
        clearModal();
        deleteCookie('picId');
        window.location.hash = '';
    }
    if (code === 112) {
        console.log("f1 key-up pressed");
        //genInfo();
    }
    if (code === 37) {
        showPrev();
    }
    if (code === 39) {
        showNext();
    }
}