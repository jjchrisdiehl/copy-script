// ==UserScript==
// @name         Zendesk Copy Notes Button
// @namespace    http://tampermonkey.net/
// @version      0.91
// @description  Adds COPY button to notes to copy to clipboard in markdown format
// @author       Senff
// @updateURL    https://github.com/Automattic/support-helper-tools/raw/main/zendesk-enhancements/zendesk-copy-notes-button/zendesk-copy-notes-button.user.js
// @match        https://woothemes.zendesk.com/agent/*
// @grant        none
// @resource     https://unpkg.com/turndown/dist/turndown.js
// @require      https://unpkg.com/turndown/dist/turndown.js
// ==/UserScript==

var $ = window.jQuery;
// create an instance of Turndown service
const turndownService = new TurndownService();

// === Add buttons to notes ===================================================
function addCopyButtons() {
    if(!$('#note-styles').length) {
        $('body').append('<style type="text/css" id="note-styles">.note-copy{border:1px solid rgb(221, 221, 221); padding:5px 10px; clear:both; float: right; border-radius: 3px;}</style>');
    }

    $('.event:not(.is-public) .comment').each(function(ind) {
        // Randomize some unique number
        var noteID = "note-"+Math.floor(1000000000 + Math.random() * 9000000000);
        if (!$(this).hasClass('copy-button-added')) {
            $(this).find('.zd-comment').attr('id',noteID).after('<button class="note-copy" data-note='+noteID+'>COPY</button>');
            $(this).addClass('copy-button-added');
        }
    });
}

// === Convert HTML to markdown and copy to the clipboard ===================================================
$("body").on('click','.note-copy', function () {
    var whichNote = $(this).attr('data-note'); // the ID of the note
    var noteHTML = $('#'+whichNote).html(); // the full note with all HTML
    const markdown = turndownService.turndown(noteHTML);
    copyStringToClipboard(markdown);
    $(this).html('COPIED!').attr('disabled','');
    setTimeout(function(){$('.note-copy').attr('disabled','removed').removeAttr('disabled').text('COPY')}, 3000);
});

// === Helper function: remove all HTML ============================================================
// === This can and should be done with regular expressions but I can't figure that out ============
function removeHTML(note) {
    var newnote = note
    .replace(/\n/g, '-newline-')
    .replace(/<br>/g, '-linebreak-')
    .replace(/<pre dir="ltr"><code>([^<]+)-newline-<\/code><\/pre>/igm, '```\n$1\n```\n')
    .replace(/<img src="([^"]+)" alt="([^<]+)">/igm, '![$2]($1)')
    .replace(/<h1 dir="auto">/g, '\n# ').replace(/<\/h1>/g, '')
    .replace(/<h2 dir="auto">/g, '\n## ').replace(/<\/h2>/g, '')
    .replace(/<h3 dir="auto">/g, '\n### ').replace(/<\/h3>/g, '\n')
    .replace(/<h4 dir="auto">/g, '\n#### ').replace(/<\/h4>/g, '\n')
    .replace(/<a href="([^"]+)" rel="([^"]+)">([^<]+)<\/a>/igm, '[$3]($1)')
    .replace(/<strong>/g, '**').replace(/<\/strong>/g, '**')
    .replace(/<em>/g, '_').replace(/<\/em>/g, '_')
    .replace(/<code>/g, '`').replace(/<\/code>/g, '`')
    .replace(/<ul dir="auto" type="disc">-newline-<li type="disc">/g, '<ul dir="auto" type="disc"><li type="disc">').replace(/<\/li>-newline-<\/ul>/g, '</li></ul>')
    .replace(/<ul dir="auto" type="disc">/g, '').replace(/<\/ul>/g, '')
    .replace(/<li type="disc"><p dir="auto">/g, '- ').replace(/<\/p><\/li>/g, '').replace(/<li type="disc">/g, '- ').replace(/<\/li>/g, '')
    .replace(/<blockquote dir="ltr">/g, '> ').replace(/<\/blockquote>/g, '')
    .replace(/<p dir="auto">/g, '').replace(/<\/p>/g, '\n')
    .replace(/<hr>/g, '--------------------------\n')
    .replace(/&nbsp/g, ' ')
    .replace(/&lt/g, '<')
    .replace(/&gt/g, '>')
    .replace(/-newline-/g, '\n')
    .replace(/-linebreak-/g, '')
    ;
}
// === Helper function: copy to clipboard ===================================================
function copyStringToClipboard (str) {
   // Create new element
   var el = document.createElement('textarea');
   // Set value (string to be copied)
   el.value = str;
   // Set non-editable to avoid focus and move outside of view
   el.setAttribute('readonly', '');
   el.style = {position: 'absolute', left: '-9999px'};
   document.body.appendChild(el);
   // Select text inside element
   el.select();
   // Copy text to clipboard
   document.execCommand('copy');
   // Remove temporary element
   document.body.removeChild(el);
}

// Loop until textbox is fully loaded
window.setInterval(function(){
    addCopyButtons();
}, 2500);
