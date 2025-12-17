// ==UserScript==
// @name        Dynamic 3-Month Calendar for Wiki (Universal)
// @version     1.1.0
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
        { date: '2025-11-01', title: 'xxxx jayanthi' },
        { date: '2025-11-09', title: 'diwali' },
        { date: '2025-12-01', title: 'Sample Event' },
        { date: '2025-12-08', title: 'Team Meeting' },
        { date: '2025-12-14', title: 'Project Review' },
        { date: '2025-12-20', title: 'Year End Review' },
        { date: '2026-01-15', title: 'Planning Session' }
    ];

    const mandatoryOffs = [
        { date: '2025-12-25', title: 'Christmas' },
        { date: '2025-12-26', title: 'Boxing Day' },
        { date: '2026-01-01', title: 'New Year Day' },
        { date: '2026-01-26', title: 'Republic Day' }
    ];

function initCss() {
    const style = document.createElement('style');
    style.textContent = `
        .calendar-main-container {
            background: #f5f3ef;
            padding: 15px; /* Changed from 15px 30px to uniform padding */
            margin: 20px auto;
            border-radius: 8px;
            max-width: 100%;
            box-sizing: border-box;
        }
        .calendar-three-month-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 40px;
            max-width: 2000px;
            margin: 0 auto;
            width: 100%;
            box-sizing: border-box;
        }
        .month-column {
            background: white;
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 15px; /* Changed from 15px 25px for uniform padding */
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            box-sizing: border-box;
        }
        .month-name-header {
            text-align: center;
            font-size: 24px;
            font-weight: bold;
            color: #FF6200;
            margin-bottom: 15px;
            padding: 8px; /* Changed from 8px 25px for uniform padding */
            border-bottom: none;
            text-transform: uppercase;
            background: white;
            border-radius: 8px;
            border: 2px solid #333;
            box-shadow: 4px 4px 0px #333;
        }
.calendar-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 0;
    background: #ddd;
    border: 1px solid #ddd;
    margin-bottom: 15px;
    height: 320px; /* Fixed height for 6 weeks + header */
}
        .day-header {
            background: #e9ecef;
            padding: 8px; /* Changed from 8px 8px for consistency */
            text-align: center;
            font-weight: bold;
            font-size: 14px;
            color: #495057;
            border: 1px solid #ddd; /* Added border for uniformity */
        }
        .day-cell {
            background: white;
            min-height: 40px;
            padding: 6px;
            text-align: center;
            font-size: 18px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #333;
            border: 1px solid #ddd; /* Added border for uniformity */
            box-sizing: border-box; /* Ensures padding doesn't affect width */
        }
        .day-cell.has-event {
            background: #FF6200;
            color: white;
            font-weight: bold;
        }
        .day-cell.has-mandatory-off {
            background: #d4e8f7;
            color: #2c5f8d;
            font-weight: bold;
            border: 2px solid #a8cce5;
        }
        .day-cell.today {
            border: 2px solid #FF6200;
            font-weight: bold;
            background: #fff3cd;
        }
        .day-cell.other-month {
            background: #f8f9fa;
            color: #adb5bd;
        }
        .section-label {
            font-size: 16px;
            font-weight: bold;
            color: #FF6200;
            margin: 15px 0 10px 0;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .event-list {
            min-height: 80px;
            max-height: 150px;
            overflow-y: auto;
        }
        .event-item {
            font-size: 15px;
            padding: 6px 0;
            color: #333;
            border-bottom: 1px solid #eee;
        }
        .event-date {
            color: #FF6200;
            font-weight: bold;
        }
        .mandatory-off-date {
            color: #2c5f8d;
            font-weight: bold;
        }
        .no-events {
            color: #999;
            font-style: italic;
            font-size: 15px;
        }
        @media (max-width: 1400px) {
            .calendar-three-month-grid {
                gap: 20px;
            }
        }
        @media (max-width: 1024px) {
            .calendar-three-month-grid {
                grid-template-columns: 1fr;
                gap: 30px;
            }
        }`;
    document.head.appendChild(style);
}

    function generateMonthCalendar(year, month, events, offs, today) {
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
            const dateStr = year + '-' +
                            String(month + 1).padStart(2, '0') + '-' +
                            String(day).padStart(2, '0');

            const isToday = cellDate.toDateString() === today.toDateString();
            const hasEvent = events.some(function(e) { return e.date === dateStr; });
            const hasMandatoryOff = offs.some(function(o) { return o.date === dateStr; });

            let classes = 'day-cell';
            if (isToday) classes += ' today';
            if (hasMandatoryOff) classes += ' has-mandatory-off';
            else if (hasEvent) classes += ' has-event';

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

    function generateEventList(year, month, events, offs) {
        const monthEvents = events.filter(function(e) {
            const parts = e.date.split('-');
            const eventYear = parseInt(parts[0]);
            const eventMonth = parseInt(parts[1]) - 1;
            return eventMonth === month && eventYear === year;
        });

        const monthOffs = offs.filter(function(o) {
            const parts = o.date.split('-');
            const offYear = parseInt(parts[0]);
            const offMonth = parseInt(parts[1]) - 1;
            return offMonth === month && offYear === year;
        });

        const allItems = [];

        monthEvents.forEach(function(event) {
            const parts = event.date.split('-');
            const day = parseInt(parts[2]);
            const eventMonth = parseInt(parts[1]) - 1;

            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                               'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const monthName = monthNames[eventMonth];

            let suffix = 'th';
            if (day > 3 && day < 21) {
                suffix = 'th';
            } else {
                const lastDigit = day % 10;
                if (lastDigit === 1) suffix = 'st';
                else if (lastDigit === 2) suffix = 'nd';
                else if (lastDigit === 3) suffix = 'rd';
            }

            allItems.push({
                date: event.date,
                html: '<div class="event-item"><span class="event-date">' + day + suffix + ' ' + monthName + '</span> - ' + event.title + '</div>'
            });
        });

        monthOffs.forEach(function(off) {
            const parts = off.date.split('-');
            const day = parseInt(parts[2]);
            const offMonth = parseInt(parts[1]) - 1;

            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                               'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const monthName = monthNames[offMonth];

            let suffix = 'th';
            if (day > 3 && day < 21) {
                suffix = 'th';
            } else {
                const lastDigit = day % 10;
                if (lastDigit === 1) suffix = 'st';
                else if (lastDigit === 2) suffix = 'nd';
                else if (lastDigit === 3) suffix = 'rd';
            }

            allItems.push({
                date: off.date,
                html: '<div class="event-item"><span class="mandatory-off-date">' + day + suffix + ' ' + monthName + '</span> - ' + off.title + ' (Mandatory Off)</div>'
            });
        });

        if (allItems.length === 0) {
            return '<div class="event-item no-events">No events scheduled</div>';
        }

        allItems.sort(function(a, b) {
            return a.date.localeCompare(b.date);
        });

        return allItems.map(function(item) { return item.html; }).join('');
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
        html += '<div class="calendar-three-month-grid">';

        months.forEach(function(monthInfo) {
            const monthDate = new Date(currentYear, currentMonth + monthInfo.offset, 1);
            const year = monthDate.getFullYear();
            const month = monthDate.getMonth();
            const monthName = monthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

            html += '<div class="month-column">';
            html += '<div class="month-name-header">' + monthName.toUpperCase() + '</div>';
            html += generateMonthCalendar(year, month, sampleEvents, mandatoryOffs, today);
            html += '<div class="section-label">' + monthInfo.label + '</div>';
            html += '<div class="event-list">' + generateEventList(year, month, sampleEvents, mandatoryOffs) + '</div>';
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
