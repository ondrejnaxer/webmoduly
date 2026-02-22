/**
 * School Schedule App - Main Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    // State
    const state = {
        currentView: 'schedule',
        selectedClass: '',
        scheduleMode: 'current', // 'permanent', 'current', 'next'
        currentDate: new Date(),
        calendarDate: new Date()
    };

    // DOM Elements
    const elements = {
        navLinks: document.querySelectorAll('.main-nav li'),
        views: document.querySelectorAll('.view'),

        // Schedule
        classSelect: document.getElementById('class-select'),
        scheduleModeFilter: document.getElementById('schedule-mode-filter'),
        scheduleModeInputs: document.querySelectorAll('input[name="schedule-mode"]'),

        scheduleHeader: document.querySelector('.schedule-header'),
        scheduleBody: document.getElementById('schedule-body'),

        // Calendar
        calendarGrid: document.getElementById('calendar-grid'),
        eventsList: document.getElementById('events-list'),
        calPrevBtn: document.getElementById('cal-prev'),
        calNextBtn: document.getElementById('cal-next'),
        calMonthYear: document.getElementById('calendar-month-year'),

        // Staff
        consultationsGrid: document.getElementById('consultations-grid'),
        contactsGrid: document.getElementById('contacts-grid'),

        // Detail Overlay
        detailOverlay: document.getElementById('detail-overlay'),
        closeDetailBtn: document.getElementById('close-detail'),
        detailContent: document.getElementById('detail-content')
    };

    // Initialize
    init();

    function init() {
        setupNavigation();
        setupScheduleControls();
        setupCalendarControls();
        setupDetailOverlay();

        // Load initial data
        loadClasses();
        renderStaff();

        // Initial Render
        renderSchedule();
        renderCalendar();
    }

    // --- Navigation ---
    function setupNavigation() {
        elements.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const tab = link.dataset.tab;
                switchView(tab);
            });
        });
    }

    function switchView(viewName) {
        // Update State
        state.currentView = viewName;

        // Update Nav UI
        elements.navLinks.forEach(link => {
            link.classList.toggle('active', link.dataset.tab === viewName);
        });

        // Update View Display
        elements.views.forEach(view => {
            view.classList.toggle('active', view.id === `view-${viewName}`);
        });
    }

    // --- Date Utilities ---
    function getMonday(d) {
        d = new Date(d);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
        return new Date(d.setDate(diff));
    }

    function addDays(date, days) {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    }

    function startOfDay(date) {
        return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    }

    function isSameDay(a, b) {
        return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
    }

    function formatDate(date) {
        return date.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'numeric' });
    }

    // --- Schedule Logic ---
    function setupScheduleControls() {
        elements.scheduleModeInputs.forEach(input => {
            input.addEventListener('change', (e) => {
                state.scheduleMode = e.target.value;
                renderSchedule();
            });
        });

        elements.classSelect.addEventListener('change', (e) => {
            state.selectedClass = e.target.value;
            renderSchedule();
        });
    }



    function loadClasses() {
        elements.classSelect.innerHTML = '<option value="">Vyberte třídu...</option>';
        mockData.classes.forEach(cls => {
            const option = document.createElement('option');
            option.value = cls.id;
            option.textContent = cls.name;
            if (cls.id === state.selectedClass) option.selected = true;
            elements.classSelect.appendChild(option);
        });
    }

    function renderSchedule() {
        if (elements.scheduleModeFilter) {
            elements.scheduleModeFilter.style.display = state.selectedClass ? 'flex' : 'none';
        }

        // Clear Grid
        elements.scheduleHeader.innerHTML = '';
        elements.scheduleBody.innerHTML = '';

        if (!state.selectedClass) {
            elements.scheduleHeader.style.display = 'none';
            elements.scheduleBody.innerHTML = '<div class="empty-schedule-msg">Vyberte třídu pro zobrazení rozvrhu.</div>';
            return;
        }

        elements.scheduleHeader.style.display = 'grid';
        elements.scheduleHeader.innerHTML = '<div class="time-header empty"></div>';

        // Render Header (Hours)
        mockData.hourDefinitions.forEach((hour, index) => {
            const div = document.createElement('div');
            div.className = 'time-header';
            div.innerHTML = `<span class="period-num">${hour.caption}</span><span class="period-time">${hour.beginTime} - ${hour.endTime}</span>`;
            elements.scheduleHeader.appendChild(div);
        });

        // Set grid columns dynamically
        const cols = mockData.hourDefinitions.length; // usually 8
        const gridTemplate = `80px repeat(${cols}, 1fr)`;

        elements.scheduleHeader.style.gridTemplateColumns = gridTemplate;

        // Render Days
        const days = ['Pondělí', 'Úterý', 'Středa', 'Čtvrtek', 'Pátek'];
        const classData = mockData.timetables[state.selectedClass] || [];

        days.forEach((dayName, dayIndex) => {
            const row = document.createElement('div');
            row.className = 'schedule-row';
            row.style.gridTemplateColumns = gridTemplate;

            // Day Header
            const dayHead = document.createElement('div');
            dayHead.className = 'day-header';

            let dayLabel = dayName;
            if (state.scheduleMode !== 'permanent') {
                const today = new Date();
                let monday = getMonday(today);
                if (state.scheduleMode === 'next') monday = addDays(monday, 7);

                const currentDayDate = addDays(monday, dayIndex);
                const dateStr = currentDayDate.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'numeric' });
                dayLabel += `<br><span class="day-date">(${dateStr})</span>`;
            }

            dayHead.innerHTML = dayLabel;
            row.appendChild(dayHead);

            // Cells
            for (let h = 1; h <= cols; h++) { // Hours 1-8
                const cell = document.createElement('div');
                cell.className = 'schedule-cell';

                // Find lessons for this cell
                const lessons = classData.filter(l => l.dayIndex === dayIndex && l.hourIndex === h);

                if (lessons.length > 0) {
                    lessons.forEach(l => {
                        let classes = 'lesson-card';
                        if (l.atom.changed) classes += ' changed';
                        if (l.atom.cancelled) classes += ' cancelled';

                        const card = document.createElement('div');
                        card.className = classes;

                        if (l.atom.cancelled && !l.atom.subject) {
                            card.innerHTML = '';
                        } else {
                            card.innerHTML = `
                                <div class="card-top">
                                    <span class="group">${l.atom.group && l.atom.group !== 'celá' ? l.atom.group : ''}</span>
                                    <span class="room">${l.atom.room || ''}</span>
                                </div>
                                <div class="subject">${l.atom.subject || ''}</div>
                                <div class="teacher">${l.atom.teacher || ''}</div>
                            `;
                        }

                        card.addEventListener('click', () => showDetail(l.atom, dayName, h));
                        cell.appendChild(card);
                    });
                }

                row.appendChild(cell);
            }

            elements.scheduleBody.appendChild(row);
        });
    }

    // --- Calendar Logic (Simplified) ---
    function setupCalendarControls() {
        elements.calPrevBtn.addEventListener('click', () => {
            state.calendarDate = new Date(state.calendarDate.getFullYear(), state.calendarDate.getMonth() - 1, 1);
            renderCalendar();
        });
        elements.calNextBtn.addEventListener('click', () => {
            state.calendarDate = new Date(state.calendarDate.getFullYear(), state.calendarDate.getMonth() + 1, 1);
            renderCalendar();
        });
    }

    function renderCalendar() {
        const today = startOfDay(new Date());
        const monthDate = new Date(state.calendarDate.getFullYear(), state.calendarDate.getMonth(), 1);
        const currentMonth = monthDate.getMonth();
        const year = monthDate.getFullYear();
        elements.calMonthYear.textContent = monthDate.toLocaleDateString('cs-CZ', { month: 'long', year: 'numeric' });

        const daysInMonth = new Date(year, currentMonth + 1, 0).getDate();
        const startOffset = (monthDate.getDay() + 6) % 7;
        const totalCells = Math.ceil((startOffset + daysInMonth) / 7) * 7;
        const monthStart = new Date(year, currentMonth, 1);
        const monthEnd = new Date(year, currentMonth, daysInMonth);

        const days = Array.from({ length: totalCells }, (_, index) => {
            const inMonth = index >= startOffset && index < startOffset + daysInMonth;
            const dayNumber = inMonth ? (index - startOffset + 1) : null;
            const date = inMonth ? new Date(year, currentMonth, dayNumber) : null;

            return {
                index,
                weekIndex: Math.floor(index / 7),
                dayIndex: index % 7,
                inMonth,
                dayNumber,
                date,
                multiSlots: [],
                singleEvents: [],
                itemColor: new Map()
            };
        });

        const dayByISO = new Map();
        days.forEach(day => {
            if (day.date) {
                dayByISO.set(day.date.toISOString().slice(0, 10), day);
            }
        });

        const normalizedEvents = mockData.events
            .map(evt => {
                const start = startOfDay(new Date(evt.dateFrom));
                const end = startOfDay(new Date(evt.dateTo));
                return {
                    evt,
                    start,
                    end: end < start ? start : end
                };
            })
            .filter(item => item.start <= monthEnd && item.end >= monthStart)
            .sort((a, b) => a.start - b.start);

        const weekLanes = Array.from({ length: Math.ceil(totalCells / 7) }, () => []);

        normalizedEvents.forEach(item => {
            const clippedStart = item.start < monthStart ? monthStart : item.start;
            const clippedEnd = item.end > monthEnd ? monthEnd : item.end;
            const isMultiDay = clippedEnd > clippedStart;

            if (!isMultiDay) {
                const day = dayByISO.get(clippedStart.toISOString().slice(0, 10));
                if (day) {
                    day.singleEvents.push(item);
                }
                return;
            }

            const startCell = startOffset + clippedStart.getDate() - 1;
            const endCell = startOffset + clippedEnd.getDate() - 1;
            const startWeek = Math.floor(startCell / 7);
            const endWeek = Math.floor(endCell / 7);

            for (let weekIndex = startWeek; weekIndex <= endWeek; weekIndex++) {
                const weekStartCell = weekIndex * 7;
                const weekEndCell = weekStartCell + 6;
                const segStartCell = Math.max(startCell, weekStartCell);
                const segEndCell = Math.min(endCell, weekEndCell);
                const startCol = segStartCell % 7;
                const endCol = segEndCell % 7;

                let lane = 0;
                while (weekLanes[weekIndex][lane] && weekLanes[weekIndex][lane].some(cellTaken => cellTaken >= startCol && cellTaken <= endCol)) {
                    lane++;
                }
                if (!weekLanes[weekIndex][lane]) {
                    weekLanes[weekIndex][lane] = [];
                }

                for (let col = startCol; col <= endCol; col++) {
                    weekLanes[weekIndex][lane].push(col);
                    const day = days[weekStartCell + col];
                    if (!day || !day.inMonth) continue;
                    day.multiSlots[lane] = {
                        item,
                        weekIndex,
                        lane,
                        startCol,
                        endCol,
                        isSegmentStart: col === startCol,
                        continuesLeft: segStartCell > startCell,
                        continuesRight: segEndCell < endCell
                    };
                }

            }
        });

        const colorPalette = ['blue', 'pink', 'green', 'orange', 'purple'];
        days.forEach(day => {
            if (!day.inMonth) return;

            const itemsInDay = [];
            day.multiSlots.forEach(slot => {
                if (slot && slot.isSegmentStart) {
                    itemsInDay.push({ ref: slot });
                }
            });
            day.singleEvents.forEach(eventRef => {
                itemsInDay.push({ ref: eventRef });
            });

            const usePalette = itemsInDay.length > 1;
            itemsInDay.forEach((itemRef, idx) => {
                const color = usePalette ? colorPalette[idx % colorPalette.length] : 'blue';
                day.itemColor.set(itemRef.ref, color);
            });
        });

        elements.calendarGrid.innerHTML = '';

        const daysOfWeek = ['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne'];
        daysOfWeek.forEach(day => {
            const headerCell = document.createElement('div');
            headerCell.className = 'day-header time-header';
            headerCell.style.borderBottom = '1px solid var(--border-color)';
            headerCell.style.textTransform = 'none';
            headerCell.textContent = day;
            elements.calendarGrid.appendChild(headerCell);
        });

        for (let i = 0; i < days.length; i++) {
            const dayInfo = days[i];
            const cell = document.createElement('div');
            cell.className = 'calendar-day';

            if (!dayInfo.inMonth) {
                cell.classList.add('outside-month', 'calendar-day-empty');
                elements.calendarGrid.appendChild(cell);
                continue;
            }

            if (isSameDay(dayInfo.date, today)) {
                cell.classList.add('today');
            }

            cell.innerHTML = `<div class="day-number">${dayInfo.dayNumber}</div>`;

            const multiTrack = document.createElement('div');
            multiTrack.className = 'calendar-multi-track';
            const maxMultiSlots = weekLanes[dayInfo.weekIndex].length;

            for (let lane = 0; lane < maxMultiSlots; lane++) {
                const laneRow = document.createElement('div');
                laneRow.className = 'event-spacer';
                const slot = dayInfo.multiSlots[lane];

                if (slot && slot.isSegmentStart) {
                    const pieceLength = slot.endCol - slot.startCol + 1;
                    const card = document.createElement('button');
                    card.type = 'button';
                    card.className = 'lesson-card calendar-event-card';
                    card.classList.add(`event-color-${dayInfo.itemColor.get(slot) || 'blue'}`);
                    card.style.width = `calc(${pieceLength} * 100% + ${pieceLength - 1} * var(--calendar-span-step))`;
                    if (slot.continuesLeft) card.classList.add('seg-continuation-left');
                    if (slot.continuesRight) card.classList.add('seg-continuation-right');
                    card.innerHTML = `<span class="subject">${slot.item.evt.title}</span>`;
                    card.addEventListener('click', (e) => {
                        e.stopPropagation();
                        showEventDetail(slot.item.evt);
                    });
                    laneRow.appendChild(card);
                }

                multiTrack.appendChild(laneRow);
            }

            cell.appendChild(multiTrack);

            const singleTrack = document.createElement('div');
            singleTrack.className = 'calendar-single-track';
            dayInfo.singleEvents.forEach(eventRef => {
                const card = document.createElement('button');
                card.type = 'button';
                card.className = 'lesson-card calendar-event-card calendar-single-event';
                card.classList.add(`event-color-${dayInfo.itemColor.get(eventRef) || 'blue'}`);
                card.innerHTML = `<span class="subject">${eventRef.evt.title}</span>`;
                card.addEventListener('click', (e) => {
                    e.stopPropagation();
                    showEventDetail(eventRef.evt);
                });
                singleTrack.appendChild(card);
            });
            cell.appendChild(singleTrack);

            elements.calendarGrid.appendChild(cell);
        }

        elements.eventsList.innerHTML = '<h3>Nadcházející akce</h3>';
        mockData.events.forEach(evt => {
            const div = document.createElement('div');
            div.className = 'event-list-item';
            const d = new Date(evt.dateFrom).toLocaleDateString('cs-CZ');
            div.innerHTML = `<strong>${d}</strong> - ${evt.title}`;
            div.addEventListener('click', () => showEventDetail(evt));
            elements.eventsList.appendChild(div);
        });
    }

    // --- Staff Logic ---
    function renderStaff() {
        // Consultations
        elements.consultationsGrid.innerHTML = '';
        elements.contactsGrid.innerHTML = '';

        mockData.staff.forEach(person => {
            const card = createStaffCard(person, true);
            elements.consultationsGrid.appendChild(card);

            const card2 = createStaffCard(person, false);
            elements.contactsGrid.appendChild(card2);
        });
    }

    function createStaffCard(person, showConsultation) {
        const div = document.createElement('div');
        div.className = 'staff-card';

        const initials = (person.firstName[0] + person.lastName[0]).toUpperCase();

        div.innerHTML = `
            <div class="staff-avatar">${initials}</div>
            <div class="staff-info">
                <h3>${person.title ? person.title + ' ' : ''}${person.firstName} ${person.lastName}</h3>
                <span class="staff-role">${person.role || 'Zaměstnanec'}</span>
                
                <div class="staff-contact">
                    <i class="fa-regular fa-envelope"></i>
                    <a href="mailto:${person.email}" class="staff-email-link">${person.email}</a>
                </div>
                ${person.phone ? `
                <div class="staff-contact">
                    <i class="fa-solid fa-phone"></i>
                    <span>${person.phone}</span>
                </div>` : ''}

                ${showConsultation && person.consultations ? `
                <div class="staff-consultation-section">
                    <div class="staff-consultation-label">KONZULTACE</div>
                    <div class="staff-consultation-value">${person.consultations}</div>
                </div>
                ` : ''}
            </div>
        `;
        return div;
    }

    // --- Detail Overlay ---
    function setupDetailOverlay() {
        elements.closeDetailBtn.addEventListener('click', closeDetail);
        elements.detailOverlay.addEventListener('click', (e) => {
            if (e.target === elements.detailOverlay) closeDetail();
        });

        // Add Escape key support to close detail modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && elements.detailOverlay.classList.contains('active')) {
                closeDetail();
            }
        });
    }

    function getScheduleDayIndex(dayName) {
        const dayMap = {
            'Pondělí': 0,
            'Úterý': 1,
            'Středa': 2,
            'Čtvrtek': 3,
            'Pátek': 4
        };
        return dayMap[dayName] ?? 0;
    }

    function getScheduleReferenceDate(dayName) {
        let monday = getMonday(new Date());
        if (state.scheduleMode === 'next') {
            monday = addDays(monday, 7);
        }
        return addDays(monday, getScheduleDayIndex(dayName));
    }

    function showDetail(atom, dayName, hourIndex) {
        let subjectName = atom.subjectFull || atom.subject || '-';
        let timeString = '';

        if (atom.subjecttext) {
            const parts = atom.subjecttext.split(' | ');
            if (parts.length >= 3) {
                subjectName = parts[0].trim() || '-';

                let datePart = parts[1].trim();
                datePart = datePart.charAt(0).toUpperCase() + datePart.slice(1);
                const scheduleDate = getScheduleReferenceDate(dayName);
                const currentYear = scheduleDate.getFullYear();

                let timePart = parts[2].trim();
                const timeMatch = timePart.match(/\((.*?)\)/);
                if (timeMatch) {
                    timePart = timeMatch[1];
                }

                timeString = `${datePart}${currentYear} @ ${timePart}`;
            }
        }

        const groupDisplay = atom.group && atom.group !== 'celá' ? atom.group : 'Všichni';

        const changeDisplay = atom.changeinfo ? `
            <div class="detail-change-alert">
                <div class="change-label">Změna</div>
                <div class="change-value">${atom.changeinfo}</div>
            </div>` : '';

        const themeDisplay = atom.theme ? `
            <div class="detail-row">
                <span class="detail-label">Téma</span>
                <span class="detail-value">${atom.theme}</span>
            </div>` : '';

        const content = `
            <div class="detail-title-container">
                <h2 class="detail-title-header">Detail rozvrhové akce</h2>
            </div>

            ${changeDisplay}

            <div class="detail-row">
                <span class="detail-label">Předmět</span>
                <span class="detail-value">${subjectName}</span>
            </div>

            ${timeString ? `
            <div class="detail-row">
                <span class="detail-label">Konání</span>
                <span class="detail-value">${timeString}</span>
            </div>` : ''}

            <div class="detail-row">
                <span class="detail-label">Místnost</span>
                <span class="detail-value">${atom.room || '-'}</span>
            </div>

            <div class="detail-row">
                <span class="detail-label">Studijní skupina</span>
                <span class="detail-value">${groupDisplay}</span>
            </div>

            <div class="detail-row">
                <span class="detail-label">Vyučující</span>
                <span class="detail-value">${atom.teacherFull || atom.teacher || '-'}</span>
            </div>

            ${themeDisplay}

            <button id="btn-close-detail" class="btn-full btn-close-bottom">Zavřít</button>
        `;

        elements.detailContent.innerHTML = content;
        elements.detailOverlay.classList.add('active');

        // Dynamically bind close event
        const closeBtn = document.getElementById('btn-close-detail');
        if (closeBtn) {
            closeBtn.addEventListener('click', closeDetail);
        }
    }

    function showEventDetail(evt) {
        const startDate = new Date(evt.dateFrom);
        const endDate = new Date(evt.dateTo);

        const isAllDay = evt.dateFrom.includes("T00:00") && evt.dateTo.includes("T23:59");
        const isSingleDay = startDate.toDateString() === endDate.toDateString();

        let dFrom, dTo;
        if (isAllDay || (isSingleDay && evt.category === 'holiday')) {
            // For all-day events, exclude the time component
            dFrom = startDate.toLocaleDateString('cs-CZ');
            dTo = endDate.toLocaleDateString('cs-CZ');
        } else {
            // Include time for events lasting specific hours
            dFrom = startDate.toLocaleString('cs-CZ');
            dTo = endDate.toLocaleString('cs-CZ');
        }

        let categoryLabel = evt.category;
        if (evt.category === 'meeting') categoryLabel = 'Schůzka';
        if (evt.category === 'holiday') categoryLabel = 'Prázdniny';
        if (evt.category === 'trip') categoryLabel = 'Výlet';

        let dateRows = '';
        if (isSingleDay && isAllDay) {
            dateRows = `
            <div class="detail-row">
                <span class="detail-label">Konání</span>
                <span class="detail-value">${dFrom}</span>
            </div>`;
        } else {
            dateRows = `
            <div class="detail-row">
                <span class="detail-label">Od</span>
                <span class="detail-value">${dFrom}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Do</span>
                <span class="detail-value">${dTo}</span>
            </div>`;
        }

        const content = `
            <div class="detail-title-container">
                <h2 class="detail-title-header">Detail akce</h2>
            </div>

            <div class="detail-row">
                <span class="detail-label">Název akce</span>
                <span class="detail-value">${evt.title}</span>
            </div>

            ${dateRows}

            <div class="detail-row">
                <span class="detail-label">Kategorie</span>
                <span class="detail-value">${categoryLabel}</span>
            </div>

            <div class="detail-row">
                <span class="detail-label">Popis akce</span>
                <span class="detail-value" style="font-weight: 400; font-size: 0.95rem;">${evt.description}</span>
            </div>

            <button id="btn-close-event-detail" class="btn-full btn-close-bottom">Zavřít</button>
        `;

        elements.detailContent.innerHTML = content;
        elements.detailOverlay.classList.add('active');

        const closeBtn = document.getElementById('btn-close-event-detail');
        if (closeBtn) {
            closeBtn.addEventListener('click', closeDetail);
        }
    }

    function closeDetail() {
        elements.detailOverlay.classList.remove('active');
    }
});
