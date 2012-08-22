// Bootstrap themes from http://bootswatch.com/
var THEMES = {
    'bootstrap': {'name': 'Bootstrap', 'cssName': 'bootstrap'},
    'cerulean': {'name': 'Cerulean', 'cssName': 'bootstrap-cerulean'},
    'united': {'name': 'United', 'cssName': 'bootstrap-united'},
    'simplex': {'name': 'Simplex', 'cssName': 'bootstrap-simplex'},
    'spacelab': {'name': 'Spacelab', 'cssName': 'bootstrap-spacelab'},
    'spruce': {'name': 'Spruce', 'cssName': 'bootstrap-spruce'},
    'superhero': {'name': 'Superhero', 'cssName': 'bootstrap-superhero'},
    'cyborg': {'name': 'Cyborg', 'cssName': 'bootstrap-cyborg'}
};

var setTheme = function (themeId) {
    if (!THEMES[themeId]) {
        return;
    }
    $('#cssLink').attr('href', '../bootstrap/css/' + THEMES[themeId].cssName + '.css');
    createCookie('theme', themeId);
    return false;
};

var onChangeTheme = function (e) {
    console.log('click');
    setTheme(e.data.id);
};

$(function () {
    var themeId = readCookie('theme'),
        themeList = $('#themeList');
    $.each(THEMES, function (id,theme) {
        var thEl = $('<a href="#">').attr('id', 'theme'+id).text(theme.name).wrap('<li>');
        themeList.append(thEl.parent());
        $('#theme'+id).on('click', {'id':id}, onChangeTheme);
    });
    if (themeId) {
        setTheme(themeId);
    }
});

function createCookie(name, value, days) {
    var date, expires;
    if (days) {
        date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toGMTString();
    }
    else {
        expires = "";
    }
    document.cookie = name + "=" + value + expires + "; path=/";
}

function readCookie(name) {
    var nameEQ = name + "=",
        c, i,
        ca = document.cookie.split(';');
    for (i = 0; i < ca.length; i++) {
        c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1, c.length);
        }
        if (c.indexOf(nameEQ) == 0) {
            return c.substring(nameEQ.length, c.length);
        }
    }
    return null;
}

function eraseCookie(name) {
    createCookie(name, "", -1);
}
