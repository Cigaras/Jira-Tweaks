// ==UserScript==
// @name         Jira Tweaks
// @namespace    https://github.com/Cigaras/Jira-Tweaks
// @version      1.3.0
// @description  Various Jira tweaks
// @author       Valdas V.
// @homepage     https://github.com/Cigaras/Jira-Tweaks
// @match        https://*/jira/*
// @icon         https://jira.atlassian.com/favicon.ico
// @require      https://raw.githubusercontent.com/odyniec/MonkeyConfig/master/monkeyconfig.js
// @grant        GM_registerMenuCommand
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// ==/UserScript==

(function() {
    'use strict';

    var cfg = new MonkeyConfig({
        title: 'Jira Tweaks config.',
        menuCommand: true,
        params: {
            sort_comments_oldest_first: {
                type: 'checkbox',
                default: true
            },
            expand_all_comments: {
                type: 'checkbox',
                default: true
            },
            add_scroll_button: {
                type: 'checkbox',
                default: true
            }
        }
    });

    // Options
    const commentsSortEnabled = true;   // Switches comments order to oldest first
    const commentsExpandEnabled = true; // Expands hidden comments
    const scrollButtonEnabled = true;   // Adds a button to scroll to the bottom of the issue view

    function expandComments(activityModule) {
        const loadButton = activityModule.querySelector('button[data-fetch-mode="newer"]');
        if (loadButton) {
            loadButton.click();
            setTimeout(expandComments, 200, activityModule);
        }
    }

    function addScrollButton(issueContainer) {

        // Create the floating button element
        var scrollButton = document.createElement('button');
        scrollButton.id = 'scroll-button';
        scrollButton.classList.add('aui-button'); // https://aui.atlassian.com/aui/9.1/docs/buttons.html
        scrollButton.style.position = 'fixed';
        scrollButton.style.bottom = '20px';
        scrollButton.style.right = '37px';
        scrollButton.style.zIndex = '9999';

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
                scrollButtonLabel.classList.remove('aui-iconfont-chevron-up-circle');
                scrollButtonLabel.classList.add('aui-iconfont-chevron-down-circle');
                scrollButtonLabel.innerHTML = '▼';
            } else {
                scrollButtonLabel.classList.remove('aui-iconfont-chevron-down-circle');
                scrollButtonLabel.classList.add('aui-iconfont-chevron-up-circle');
                scrollButtonLabel.innerHTML = '▲';
            }
        });

        // Append the button to the document body
        document.body.appendChild(scrollButton);
    }

    // Main function, executed every 2 seconds
    setInterval(() => {
        const activityModule = document.getElementById('activitymodule');
        if (activityModule) {

            if (cfg.get('sort_comments_oldest_first')) {
                const sortButton = activityModule.querySelector("#sort-button[data-order='asc']");
                if (sortButton) {
                    sortButton.click();
                    if (cfg.get('expand_all_comments')) {
                        setTimeout(expandComments, 200, activityModule);
                    }
                } else {
                    if (cfg.get('expand_all_comments')) {
                        expandComments(activityModule);
                    }
                }
            } else {
                if (cfg.get('expand_all_comments')) {
                    expandComments(activityModule);
                }
            }

            if (cfg.get('add_scroll_button')) {
                var issueContainer = document.querySelector(".issue-view, .detail-panel");
                var scrollButton = document.getElementById('scroll-button');
                if (issueContainer) {
                    if (!scrollButton) {
                        addScrollButton(issueContainer);
                    }
                } else {
                    if (scrollButton) {
                        console.error('🐞 Scroll button visible without issue container, should be removed!')
                    }
                }
            }

        } else {
            var scrollButton = document.getElementById('scroll-button');
            if (scrollButton) {
                console.error('🐞 Scroll button visible without activity moodule, should be removed!')
            }
        }
    }, 2000);

})();