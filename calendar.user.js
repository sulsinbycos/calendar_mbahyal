// ==UserScript==
// @name        Dynamic 3-Month Calendar for Wiki (Universal)
// @version     1.0.5
// @author      mbahyal
// @description Universal calendar widget - works on any Amazon wiki page
// @match       https://w.amazon.com/*
// @namespace   https://amazon.com/
// @grant       none
// @run-at      document-end
// ==/UserScript==
(function() {
    'use strict';

    console.log('Calendar script loaded on:', window.location.href);

    const sampleEvents = [
        { date: '2024-11-01', title: 'xxxx jayanthi' },
        { date: '2024-11-09', title: 'diwali' },
        { date: '2024-12-01', title: 'Sample Event' },
        { date: '2024-12-08', title: 'Team Meeting' },
        { date: '2024-12-14', title: 'Project Review' },
        { date: '2025-01-15', title: 'Planning Session' }
    ];

    function initCss() {
        const style = document.createElement('style');
        style.textContent = '.calendar-main-container { background: #f5f3ef; padding: 30px; margin: 20px 0; border-radius: 8px; } .calendar-header-title { text-align: center; font-size: 32px; font-weight: bold; color: #333; margin-bottom: 30px; padding: 25px; background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); } .calendar-three-month-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 40px; max-width: 2000px; margin: 0 auto; } .month-column { background: white; border: 1px solid #ddd; border-radius: 8px; padding: 25px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); } .month-name-header { text-align: center; font-size: 24px; font-weight: bold; color: #FF6200; margin-bottom: 25px; padding: 12px 25px; border-bottom: none; text-transform: uppercase; background: white; border-radius: 8px; border: 2px solid #333; box-shadow: 4px 4px 0px #333; } .calendar-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; background: #ddd; border: 1px solid #ddd; margin-bottom: 30px; } .day-header { background: #e9ecef; padding: 15px 8px; text-align: center; font-weight: bold; font-size: 14px; color: #495057; } .day-cell { background: white; min-height: 60px; padding: 10px; text-align: center; font-size: 18px; display: flex; align-items: center; justify-content: center; color: #333; } .day-cell.has-event { background: #FF6200; color: white; font-weight: bold; } .day-cell.today { border: 2px solid #FF6200; font-weight: bold; background: #fff3cd; } .day-cell.other-month { background: #f8f9fa; color: #adb5bd; } .section-label { font-size: 16px; font-weight: bold; color: #FF6200; margin: 25px 0 15px 0; text-transform: uppercase; letter-spacing: 0.5px; } .event-list { min-height: 100px; max-height: 200px; overflow-y: auto; } .event-item { font-size: 15px; padding: 8px 0; color: #333; border-bottom: 1px solid #eee; } .event-date { color: #FF6200; font-weight: bold; } .no-events { color: #999; font-style: italic; font-size: 15px; }';
        document.head.appendChild(style);
    }

    function generateMonthCalendar(year, month, events, today) {
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const prevMonthDays = new Date(year, month, 0).getDate();

        let html = '<div class="calendar-grid">';

        const dayNames = ['SUN', 'MON', 'TUES', 'WED', 'THUR', 'FRI', 'SAT'];
        dayNames.forEach(function(day) {
            html += '<div class="day-header">' + day + '</div>';
        });

        for (let i = firstDay - 1; i >= 0; i--) {
            const day = prevMonthDays - i;
            html += '<div class="day-cell other-month">' + day + '</div>';
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const cellDate = new Date(year, month, day);
            const dateStr = cellDate.toISOString().split('T');
            const isToday = cellDate.toDateString() === today.toDateString();
            const hasEvent = events.some(function(e) { return e.date === dateStr; });

            let classes = 'day-cell';
            if (isToday) classes += ' today';
            if (hasEvent) classes += ' has-event';

            html += '<div class="' + classes + '">' + day + '</div>';
        }

        const totalCells = firstDay + daysInMonth;
        const remainingCells = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
        for (let day = 1; day <= remainingCells; day++) {
            html += '<div class="day-cell other-month">' + day + '</div>';
        }

        html += '</div>';
        return html;
    }

    function generateEventList(year, month, events) {
        const monthEvents = events.filter(function(e) {
            const eventDate = new Date(e.date);
            return eventDate.getMonth() === month && eventDate.getFullYear() === year;
        });

        if (monthEvents.length === 0) {
            return '<div class="event-item no-events">No events scheduled</div>';
        }

        return monthEvents.map(function(event) {
            const eventDate = new Date(event.date);
            const day = eventDate.getDate();
            const monthName = eventDate.toLocaleDateString('en-US', { month: 'short' });

            let suffix = 'th';
            if (day > 3 && day < 21) {
                suffix = 'th';
            } else {
                const lastDigit = day % 10;
                if (lastDigit === 1) suffix = 'st';
                else if (lastDigit === 2) suffix = 'nd';
                else if (lastDigit === 3) suffix = 'rd';
            }

            return '<div class="event-item"><span class="event-date">' + day + suffix + ' ' + monthName + '</span> - ' + event.title + '</div>';
        }).join('');
    }

    function generateThreeMonthView() {
        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();

        const months = [
            { offset: -1, label: 'PREVIOUS EVENTS' },
            { offset: 0, label: 'CURRENT MONTH EVENTS' },
            { offset: 1, label: 'UPCOMING EVENTS' }
        ];

        let html = '<div class="calendar-main-container">';
        html += '<div class="calendar-header-title">CALENDAR</div>';
        html += '<div class="calendar-three-month-grid">';

        months.forEach(function(monthInfo) {
            const monthDate = new Date(currentYear, currentMonth + monthInfo.offset, 1);
            const year = monthDate.getFullYear();
            const month = monthDate.getMonth();
            const monthName = monthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

            html += '<div class="month-column">';
            html += '<div class="month-name-header">' + monthName.toUpperCase() + '</div>';
            html += generateMonthCalendar(year, month, sampleEvents, today);
            html += '<div class="section-label">' + monthInfo.label + '</div>';
            html += '<div class="event-list">' + generateEventList(year, month, sampleEvents) + '</div>';
            html += '</div>';
        });

        html += '</div></div>';
        return html;
    }

    function renderCalendar() {
        console.log('Attempting to render calendar...');

        const displayContainer = document.querySelector('.SharedCalendarDisplay');
        console.log('Found container:', displayContainer);

        if (!displayContainer) {
            console.log('Container not found, will retry...');
            return false;
        }

        initCss();
        displayContainer.innerHTML = '';
        const calendarHtml = generateThreeMonthView();
        displayContainer.innerHTML = calendarHtml;

        console.log('Calendar rendered successfully!');
        return true;
    }

    function tryRender(attempts) {
        attempts = attempts || 0;
        if (attempts > 10) {
            console.log('Max attempts reached, calendar container not found');
            return;
        }

        if (!renderCalendar()) {
            setTimeout(function() { tryRender(attempts + 1); }, 500);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() { tryRender(); });
    } else {
        tryRender();
    }

    const observer = new MutationObserver(function() {
        if (document.querySelector('.SharedCalendarDisplay') &&
            !document.querySelector('.calendar-main-container')) {
            renderCalendar();
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

})();

