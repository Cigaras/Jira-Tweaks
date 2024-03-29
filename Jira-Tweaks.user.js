// ==UserScript==
// @name         Jira Tweaks
// @namespace    https://github.com/Cigaras/Jira-Tweaks
// @version      1.0.7
// @description  Various Jira tweaks
// @author       Valdas V.
// @homepage     https://github.com/Cigaras/Jira-Tweaks
// @match        https://*/jira/*
// @icon         https://jira.atlassian.com/favicon.ico
// @require      https://raw.githubusercontent.com/odyniec/MonkeyConfig/51456c3/monkeyconfig.js
// @require      http://code.jquery.com/jquery-latest.js
// @grant        GM_registerMenuCommand
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// ==/UserScript==

(function() {
    'use strict';

    // Config
    var cfg = new MonkeyConfig({
        title: 'Jira Tweaks configuration',
        menuCommand: true,
        params: {
            change_activity_items_order_to_oldest_first: {
                type: 'checkbox',
                default: true
            },
            load_newer_activity_items: {
                type: 'checkbox',
                default: true
            },
            add_quick_scroll_button: {
                type: 'checkbox',
                default: true
            }
        }
    });

    // Define shift click
    var shiftClick = jQuery.Event("click");
    shiftClick.shiftKey = true;

    // Find button "Load newer" and shift click it
    function loadActivityItems(activityModule) {
        const loadButton = $('button[data-fetch-mode="newer"]');
        if (loadButton && loadButton.is(':visible')) {
            loadButton.trigger(shiftClick);
        }
    }

    // Add scroll button
    function addScrollButton(issueContainer) {

        // Create the floating button element
        var scrollButton = document.createElement('button');
        scrollButton.id = 'scroll-button';
        scrollButton.classList.add('aui-button'); // https://aui.atlassian.com/aui/9.1/docs/buttons.html
        scrollButton.style.position = 'fixed';
        scrollButton.style.bottom = '20px';
        scrollButton.style.right = '37px';
        scrollButton.style.zIndex = '9999';
        scrollButton.title = 'Scroll to bottom';

        // Create the button label element
        var scrollButtonLabel = document.createElement('span');
        scrollButtonLabel.classList.add('aui-icon'); // https://aui.atlassian.com/aui/9.1/docs/icons.html
        scrollButtonLabel.classList.add('aui-icon-small');
        scrollButtonLabel.classList.add('aui-iconfont-chevron-down-circle');
        scrollButtonLabel.innerHTML = '▼';

        // Append the label to the button
        scrollButton.appendChild(scrollButtonLabel);

        // Add button event listener
        scrollButton.addEventListener('click', function() {
            if (issueContainer.scrollTop < (issueContainer.scrollHeight - issueContainer.clientHeight)) {
                issueContainer.scrollTo({
                    top: issueContainer.scrollHeight,
                    behavior: 'smooth'
                });
            } else {
                issueContainer.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            }
        });

        // Add scroll event listener
        issueContainer.addEventListener('scroll', function() {
            if (issueContainer.scrollTop < (issueContainer.scrollHeight - issueContainer.clientHeight)) {
                scrollButton.title = 'Scroll to bottom';
                scrollButtonLabel.classList.remove('aui-iconfont-chevron-up-circle');
                scrollButtonLabel.classList.add('aui-iconfont-chevron-down-circle');
                scrollButtonLabel.innerHTML = '▼';
            } else {
                scrollButton.title = 'Scroll to top';
                scrollButtonLabel.classList.remove('aui-iconfont-chevron-down-circle');
                scrollButtonLabel.classList.add('aui-iconfont-chevron-up-circle');
                scrollButtonLabel.innerHTML = '▲';
            }
        });

        // Append the button to the document body
        document.body.appendChild(scrollButton);
    }

    // Main function, executed every second
    setInterval(() => {
        const activityModule = document.getElementById('activitymodule');
        if (activityModule) {
            if (cfg.get('change_activity_items_order_to_oldest_first')) {
                const sortButton = activityModule.querySelector("#sort-button[data-order='asc']");
                if (sortButton) {
                    sortButton.click();
                } else {
                    if (cfg.get('load_newer_activity_items')) {
                        loadActivityItems(activityModule);
                    }
                }
            } else {
                if (cfg.get('load_newer_activity_items')) {
                    loadActivityItems(activityModule);
                }
            }
            if (cfg.get('add_quick_scroll_button')) {
                var issueContainer = document.querySelector(".issue-view, .detail-panel");
                if (issueContainer) {
                    var scrollButton = document.getElementById('scroll-button');
                    if (!scrollButton) {
                        addScrollButton(issueContainer);
                    }
                }
            }
        }
    }, 1000);

})();
