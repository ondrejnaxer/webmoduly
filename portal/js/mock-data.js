/**
 * Mock Data for School Schedule App
 * Simulates API responses from the backend
 */

const mockData = {
    // 8.1 Parameters
    hourDefinitions: [
        { caption: "1", beginTime: "8:00", endTime: "8:45" },
        { caption: "2", beginTime: "8:55", endTime: "9:40" },
        { caption: "3", beginTime: "10:00", endTime: "10:45" },
        { caption: "4", beginTime: "10:55", endTime: "11:40" },
        { caption: "5", beginTime: "11:50", endTime: "12:35" },
        { caption: "6", beginTime: "12:45", endTime: "13:30" },
        { caption: "7", beginTime: "13:35", endTime: "14:20" },
        { caption: "8", beginTime: "14:25", endTime: "15:10" }
    ],

    // Classes list (for dropdown)
    classes: [
        { id: "1A", name: "1.A" },
        { id: "2A", name: "2.A" },
        { id: "3A", name: "3.A" },
        { id: "4A", name: "4.A" }
    ],

    // 8.2 & 8.3 Timetable Data
    // We will use a generator function in app.js to create varied data, 
    // but here is a static sample structure for reference or fallback.
    timetables: {
        "4A": [
            {
                "dayIndex": 0,
                "hourIndex": 1,
                "atom": {
                    "subject": "CH",
                    "teacher": "Zir",
                    "room": "202",
                    "group": "",
                    "changed": false,
                    "type": "atom",
                    "subjecttext": "Chemie | po 16.2. | 1 (8:00 - 8:45)",
                    "teacherFull": "Mgr. Radovana Zichová",
                    "theme": "Názvosloví iontů",
                    "notice": "",
                    "changeinfo": "",
                    "homeworks": null,
                    "absencetext": null,
                    "hasAbsent": false,
                    "absentInfoText": ""
                }
            },
            {
                "dayIndex": 0,
                "hourIndex": 2,
                "atom": {
                    "subject": "ME",
                    "teacher": "Plb",
                    "room": "202",
                    "group": "",
                    "changed": false,
                    "type": "atom",
                    "subjecttext": "Mechanika | po 16.2. | 2 (8:50 - 9:35)",
                    "teacherFull": "Ing. Jana Palubjaková",
                    "theme": "SSO - grafická metoda, 1.vzor.příklad",
                    "notice": "",
                    "changeinfo": "",
                    "homeworks": null,
                    "absencetext": null,
                    "hasAbsent": false,
                    "absentInfoText": ""
                }
            },
            {
                "dayIndex": 0,
                "hourIndex": 3,
                "atom": {
                    "subject": "ME",
                    "teacher": "Plb",
                    "room": "202",
                    "group": "",
                    "changed": true,
                    "type": "atom",
                    "subjecttext": "Mechanika | po 16.2. | 3 (9:45 - 10:30)",
                    "teacherFull": "Ing. Jana Palubjaková",
                    "theme": "SSO - grafická metoda,2.příklad",
                    "notice": "",
                    "changeinfo": "Přesun z 17.2., 7: ME, Palubjaková Jana, 202",
                    "homeworks": null,
                    "absencetext": null,
                    "hasAbsent": false,
                    "absentInfoText": ""
                }
            },
            {
                "dayIndex": 0,
                "hourIndex": 4,
                "atom": {
                    "subject": "ČJL",
                    "teacher": "Fen",
                    "room": "202",
                    "group": "",
                    "changed": false,
                    "type": "atom",
                    "subjecttext": "Český jazyk a literatura | po 16.2. | 4 (10:50 - 11:35)",
                    "teacherFull": "Mgr. Věra Fenclová",
                    "theme": "Diktát a jazykový rozbor",
                    "notice": "",
                    "changeinfo": "",
                    "homeworks": null,
                    "absencetext": null,
                    "hasAbsent": false,
                    "absentInfoText": ""
                }
            },
            {
                "dayIndex": 0,
                "hourIndex": 5,
                "atom": {
                    "subject": "M",
                    "teacher": "Poh",
                    "room": "202",
                    "group": "",
                    "changed": false,
                    "type": "atom",
                    "subjecttext": "Matematika | po 16.2. | 5 (11:40 - 12:25)",
                    "teacherFull": "PaedDr. Stanislav Pohl",
                    "theme": "Mocniny s exponentem celočíselným v příkladech",
                    "notice": "",
                    "changeinfo": "",
                    "homeworks": null,
                    "absencetext": null,
                    "hasAbsent": false,
                    "absentInfoText": ""
                }
            },
            {
                "dayIndex": 0,
                "hourIndex": 6,
                "atom": {
                    "subject": "M",
                    "teacher": "Poh",
                    "room": "202",
                    "group": "",
                    "changed": false,
                    "type": "atom",
                    "subjecttext": "Matematika | po 16.2. | 6 (12:35 - 13:20)",
                    "teacherFull": "PaedDr. Stanislav Pohl",
                    "theme": "Odmocniny - Zavedení a základní příklady",
                    "notice": "",
                    "changeinfo": "",
                    "homeworks": null,
                    "absencetext": null,
                    "hasAbsent": false,
                    "absentInfoText": ""
                }
            },
            {
                "dayIndex": 0,
                "hourIndex": 7,
                "atom": {
                    "subject": "AJ",
                    "teacher": "Vrh",
                    "room": "202",
                    "group": "AJ1",
                    "changed": false,
                    "type": "atom",
                    "subjecttext": "Anglický jazyk | po 16.2. | 7 (13:25 - 14:10)",
                    "teacherFull": "Mgr. Angelika Vrhelová",
                    "theme": "Prezentace - Lukostřelba",
                    "notice": "",
                    "changeinfo": "",
                    "homeworks": null,
                    "absencetext": null,
                    "hasAbsent": false,
                    "absentInfoText": ""
                }
            },
            {
                "dayIndex": 1,
                "hourIndex": 1,
                "atom": {
                    "subject": "TK",
                    "teacher": "Fov",
                    "room": "205",
                    "group": "TK2",
                    "changed": false,
                    "type": "atom",
                    "subjecttext": "Technické kreslení | út 17.2. | 1 (8:00 - 8:45)",
                    "teacherFull": "Ing. Vojtěch Forman",
                    "theme": "MP - Průsek obrazců",
                    "notice": "",
                    "changeinfo": "",
                    "homeworks": null,
                    "absencetext": null,
                    "hasAbsent": false,
                    "absentInfoText": ""
                }
            },
            {
                "dayIndex": 1,
                "hourIndex": 1,
                "atom": {
                    "subject": "AJ",
                    "teacher": "Vrh",
                    "room": "202",
                    "group": "AJ1",
                    "changed": false,
                    "type": "atom",
                    "subjecttext": "Anglický jazyk | út 17.2. | 1 (8:00 - 8:45)",
                    "teacherFull": "Mgr. Angelika Vrhelová",
                    "theme": "Prezentace - Lední hokej",
                    "notice": "",
                    "changeinfo": "",
                    "homeworks": null,
                    "absencetext": null,
                    "hasAbsent": false,
                    "absentInfoText": ""
                }
            },
            {
                "dayIndex": 1,
                "hourIndex": 2,
                "atom": {
                    "subject": "TK",
                    "teacher": "Fov",
                    "room": "205",
                    "group": "TK2",
                    "changed": false,
                    "type": "atom",
                    "subjecttext": "Technické kreslení | út 17.2. | 2 (8:50 - 9:35)",
                    "teacherFull": "Ing. Vojtěch Forman",
                    "theme": "Technické zobrazování",
                    "notice": "",
                    "changeinfo": "",
                    "homeworks": null,
                    "absencetext": null,
                    "hasAbsent": false,
                    "absentInfoText": ""
                }
            },
            {
                "dayIndex": 1,
                "hourIndex": 2,
                "atom": {
                    "subject": "AJ",
                    "teacher": "Vrh",
                    "room": "202",
                    "group": "AJ1",
                    "changed": false,
                    "type": "atom",
                    "subjecttext": "Anglický jazyk | út 17.2. | 2 (8:50 - 9:35)",
                    "teacherFull": "Mgr. Angelika Vrhelová",
                    "theme": "Prezentace - Judo",
                    "notice": "",
                    "changeinfo": "",
                    "homeworks": null,
                    "absencetext": null,
                    "hasAbsent": false,
                    "absentInfoText": ""
                }
            },
            {
                "dayIndex": 1,
                "hourIndex": 3,
                "atom": {
                    "subject": "ZEL",
                    "teacher": "Glo",
                    "room": "202",
                    "group": "",
                    "changed": true,
                    "type": "atom",
                    "subjecttext": "Základy elektrotechniky | út 17.2. | 3 (9:45 - 10:30)",
                    "teacherFull": "Ing. Miroslav Glöckner",
                    "theme": "Řešení el.obvodů s rezistory, spojování zdrojů bapětí",
                    "notice": "",
                    "changeinfo": "Suplování: Glöckner Miroslav",
                    "homeworks": null,
                    "absencetext": null,
                    "hasAbsent": false,
                    "absentInfoText": ""
                }
            },
            {
                "dayIndex": 1,
                "hourIndex": 4,
                "atom": {
                    "subject": "CH",
                    "teacher": "Zir",
                    "room": "202",
                    "group": "",
                    "changed": false,
                    "type": "atom",
                    "subjecttext": "Chemie | út 17.2. | 4 (10:50 - 11:35)",
                    "teacherFull": "Mgr. Radovana Zichová",
                    "theme": "Názvosloví iontů",
                    "notice": "",
                    "changeinfo": "",
                    "homeworks": null,
                    "absencetext": null,
                    "hasAbsent": false,
                    "absentInfoText": ""
                }
            },
            {
                "dayIndex": 1,
                "hourIndex": 5,
                "atom": {
                    "subject": "M",
                    "teacher": "Poh",
                    "room": "202",
                    "group": "",
                    "changed": false,
                    "type": "atom",
                    "subjecttext": "Matematika | út 17.2. | 5 (11:40 - 12:25)",
                    "teacherFull": "PaedDr. Stanislav Pohl",
                    "theme": "Odmocniny - Základní věty pro počítání s odmocninami",
                    "notice": "",
                    "changeinfo": "",
                    "homeworks": null,
                    "absencetext": null,
                    "hasAbsent": false,
                    "absentInfoText": ""
                }
            },
            {
                "dayIndex": 1,
                "hourIndex": 6,
                "atom": {
                    "subject": "SPV",
                    "teacher": "Fen",
                    "room": "202",
                    "group": "",
                    "changed": false,
                    "type": "atom",
                    "subjecttext": "Společenské vědy | út 17.2. | 6 (12:35 - 13:20)",
                    "teacherFull": "Mgr. Věra Fenclová",
                    "theme": "Česko-německé vztahy, postavení minorit, dualismus v habsburské monarchii, vzni národního státu v Německu",
                    "notice": "",
                    "changeinfo": "",
                    "homeworks": null,
                    "absencetext": null,
                    "hasAbsent": false,
                    "absentInfoText": ""
                }
            },
            {
                "dayIndex": 1,
                "hourIndex": 7,
                "atom": {
                    "subject": "",
                    "teacher": "",
                    "room": "",
                    "group": "",
                    "cancelled": true,
                    "changeinfo": "Přesun na 16.2., 3. hod (ME, Palubjaková Jana)"
                }
            },
            {
                "dayIndex": 2,
                "hourIndex": 1,
                "atom": {
                    "subject": "TVS",
                    "teacher": "Kob",
                    "room": "TV1",
                    "group": "TV1",
                    "changed": false,
                    "type": "atom",
                    "subjecttext": "Tělesná výchova a sport | st 18.2. | 1 (8:00 - 8:45)",
                    "teacherFull": "Mgr. Jiří Kouba",
                    "theme": "SH - basketbal - HČJ, pravidla, hra",
                    "notice": "",
                    "changeinfo": "",
                    "homeworks": null,
                    "absencetext": null,
                    "hasAbsent": false,
                    "absentInfoText": ""
                }
            },
            {
                "dayIndex": 2,
                "hourIndex": 1,
                "atom": {
                    "subject": "TVS",
                    "teacher": "Kba",
                    "room": "TV2",
                    "group": "TV2",
                    "changed": false,
                    "type": "atom",
                    "subjecttext": "Tělesná výchova a sport | st 18.2. | 1 (8:00 - 8:45)",
                    "teacherFull": "Mgr. Marcela Koubová",
                    "theme": "SG - cvičení na hrazdě a kruzích - procvičování",
                    "notice": "",
                    "changeinfo": "",
                    "homeworks": null,
                    "absencetext": null,
                    "hasAbsent": false,
                    "absentInfoText": ""
                }
            },
            {
                "dayIndex": 2,
                "hourIndex": 2,
                "atom": {
                    "subject": "TVS",
                    "teacher": "Kob",
                    "room": "TV1",
                    "group": "TV1",
                    "changed": false,
                    "type": "atom",
                    "subjecttext": "Tělesná výchova a sport | st 18.2. | 2 (8:50 - 9:35)",
                    "teacherFull": "Mgr. Jiří Kouba",
                    "theme": "SG - cvičení na hrazdě a kruzích - procvičení",
                    "notice": "",
                    "changeinfo": "",
                    "homeworks": null,
                    "absencetext": null,
                    "hasAbsent": false,
                    "absentInfoText": ""
                }
            },
            {
                "dayIndex": 2,
                "hourIndex": 2,
                "atom": {
                    "subject": "TVS",
                    "teacher": "Kba",
                    "room": "TV2",
                    "group": "TV2",
                    "changed": false,
                    "type": "atom",
                    "subjecttext": "Tělesná výchova a sport | st 18.2. | 2 (8:50 - 9:35)",
                    "teacherFull": "Mgr. Marcela Koubová",
                    "theme": "SH - basketbal - pravidla, HČJ, hra",
                    "notice": "",
                    "changeinfo": "",
                    "homeworks": null,
                    "absencetext": null,
                    "hasAbsent": false,
                    "absentInfoText": ""
                }
            },
            {
                "dayIndex": 2,
                "hourIndex": 3,
                "atom": {
                    "subject": "F",
                    "teacher": "Har",
                    "room": "202",
                    "group": "",
                    "changed": false,
                    "type": "atom",
                    "subjecttext": "Fyzika | st 18.2. | 3 (9:45 - 10:30)",
                    "teacherFull": "Ing. Jan Hartman",
                    "theme": "Test energie",
                    "notice": "",
                    "changeinfo": "",
                    "homeworks": null,
                    "absencetext": null,
                    "hasAbsent": false,
                    "absentInfoText": ""
                }
            },
            {
                "dayIndex": 2,
                "hourIndex": 4,
                "atom": {
                    "subject": "VT",
                    "teacher": "Nxr",
                    "room": "002",
                    "group": "VT1",
                    "changed": false,
                    "type": "atom",
                    "subjecttext": "Výpočetní technika | st 18.2. | 4 (10:50 - 11:35)",
                    "teacherFull": "Mgr. Rudolf Naxer",
                    "theme": "Excel - procvičování, nastavení před tiskem",
                    "notice": "",
                    "changeinfo": "",
                    "homeworks": null,
                    "absencetext": null,
                    "hasAbsent": false,
                    "absentInfoText": ""
                }
            },
            {
                "dayIndex": 2,
                "hourIndex": 4,
                "atom": {
                    "subject": "VT",
                    "teacher": "Fra",
                    "room": "VT3",
                    "group": "VT2",
                    "changed": false,
                    "type": "atom",
                    "subjecttext": "Výpočetní technika | st 18.2. | 4 (10:50 - 11:35)",
                    "teacherFull": "Ing. Silvie Fránová",
                    "theme": "Digitální technologie - Bezpečnost v digitálním prostředí - způsoby útoků na technologie, základní prvky ochrany (např. aktualizace softwaru, antivir, firewall, VPN, šifrování)",
                    "notice": "",
                    "changeinfo": "",
                    "homeworks": null,
                    "absencetext": null,
                    "hasAbsent": false,
                    "absentInfoText": ""
                }
            },
            {
                "dayIndex": 2,
                "hourIndex": 5,
                "atom": {
                    "subject": "VT",
                    "teacher": "Nxr",
                    "room": "002",
                    "group": "VT1",
                    "changed": false,
                    "type": "atom",
                    "subjecttext": "Výpočetní technika | st 18.2. | 5 (11:40 - 12:25)",
                    "teacherFull": "Mgr. Rudolf Naxer",
                    "theme": "Excel - procvičování, nastavení před tiskem",
                    "notice": "",
                    "changeinfo": "",
                    "homeworks": null,
                    "absencetext": null,
                    "hasAbsent": false,
                    "absentInfoText": ""
                }
            },
            {
                "dayIndex": 2,
                "hourIndex": 5,
                "atom": {
                    "subject": "VT",
                    "teacher": "Fra",
                    "room": "VT3",
                    "group": "VT2",
                    "changed": false,
                    "type": "atom",
                    "subjecttext": "Výpočetní technika | st 18.2. | 5 (11:40 - 12:25)",
                    "teacherFull": "Ing. Silvie Fránová",
                    "theme": "Digitální technologie - Bezpečnost v digitálním prostředí - způsoby útoků na technologie, základní prvky ochrany (např. aktualizace softwaru, antivir, firewall, VPN, šifrování)",
                    "notice": "",
                    "changeinfo": "",
                    "homeworks": null,
                    "absencetext": null,
                    "hasAbsent": false,
                    "absentInfoText": ""
                }
            },
            {
                "dayIndex": 2,
                "hourIndex": 6,
                "atom": {
                    "subject": "TK",
                    "teacher": "Sta",
                    "room": "202",
                    "group": "",
                    "changed": false,
                    "type": "atom",
                    "subjecttext": "Technické kreslení | st 18.2. | 6 (12:35 - 13:20)",
                    "teacherFull": "Ing. Hana Šťastná",
                    "theme": "Technické zobrazování",
                    "notice": "",
                    "changeinfo": "",
                    "homeworks": null,
                    "absencetext": null,
                    "hasAbsent": false,
                    "absentInfoText": ""
                }
            },
            {
                "dayIndex": 2,
                "hourIndex": 7,
                "atom": {
                    "subject": "M",
                    "teacher": "Poh",
                    "room": "202",
                    "group": "",
                    "changed": false,
                    "type": "atom",
                    "subjecttext": "Matematika | st 18.2. | 7 (13:25 - 14:10)",
                    "teacherFull": "PaedDr. Stanislav Pohl",
                    "theme": "Odmocniny - Základní příklady",
                    "notice": "",
                    "changeinfo": "",
                    "homeworks": null,
                    "absencetext": null,
                    "hasAbsent": false,
                    "absentInfoText": ""
                }
            },
            {
                "dayIndex": 3,
                "hourIndex": 1,
                "atom": {
                    "subject": "ZEL",
                    "teacher": "Urb",
                    "room": "202",
                    "group": "",
                    "changed": true,
                    "type": "atom",
                    "subjecttext": "Základy elektrotechniky | čt 19.2. | 1 (8:00 - 8:45)",
                    "teacherFull": "Mgr. Irina Urbanová",
                    "theme": "Základní zapojení a galvanické články",
                    "notice": "",
                    "changeinfo": "Suplování: Urbanová Irina",
                    "homeworks": null,
                    "absencetext": null,
                    "hasAbsent": false,
                    "absentInfoText": ""
                }
            },
            {
                "dayIndex": 3,
                "hourIndex": 2,
                "atom": {
                    "subject": "ZEL",
                    "teacher": "Zic",
                    "room": "202",
                    "group": "",
                    "changed": true,
                    "type": "atom",
                    "subjecttext": "Základy elektrotechniky | čt 19.2. | 2 (8:50 - 9:35)",
                    "teacherFull": "Mgr. Pavel Zicha",
                    "theme": "Základní zapojení a galvanické články",
                    "notice": "",
                    "changeinfo": "Suplování: Zicha Pavel",
                    "homeworks": null,
                    "absencetext": null,
                    "hasAbsent": false,
                    "absentInfoText": ""
                }
            },
            {
                "dayIndex": 3,
                "hourIndex": 3,
                "atom": {
                    "subject": "ČJL",
                    "teacher": "Fen",
                    "room": "202",
                    "group": "",
                    "changed": false,
                    "type": "atom",
                    "subjecttext": "Český jazyk a literatura | čt 19.2. | 3 (9:45 - 10:30)",
                    "teacherFull": "Mgr. Věra Fenclová",
                    "theme": "Aktivní poznávání různých druhů umění našeho i světového, současného i minulého, v tradiční i mediální podobě",
                    "notice": "",
                    "changeinfo": "",
                    "homeworks": null,
                    "absencetext": null,
                    "hasAbsent": false,
                    "absentInfoText": ""
                }
            },
            {
                "dayIndex": 3,
                "hourIndex": 4,
                "atom": {
                    "subject": "D",
                    "teacher": "Lra",
                    "room": "202",
                    "group": "",
                    "changed": false,
                    "type": "atom",
                    "subjecttext": "Dějepis | čt 19.2. | 4 (10:50 - 11:35)",
                    "teacherFull": "Mgr. Dagmar Lorencová",
                    "theme": "Mezinárodní vztahy ve 20. a 30.letech",
                    "notice": "",
                    "changeinfo": "",
                    "homeworks": null,
                    "absencetext": null,
                    "hasAbsent": false,
                    "absentInfoText": ""
                }
            },
            {
                "dayIndex": 3,
                "hourIndex": 5,
                "atom": {
                    "subject": "SPV",
                    "teacher": "Fen",
                    "room": "202",
                    "group": "",
                    "changed": false,
                    "type": "atom",
                    "subjecttext": "Společenské vědy | čt 19.2. | 5 (11:40 - 12:25)",
                    "teacherFull": "Mgr. Věra Fenclová",
                    "theme": "Majorita a minority ve společnosti, migrace",
                    "notice": "",
                    "changeinfo": "",
                    "homeworks": null,
                    "absencetext": null,
                    "hasAbsent": false,
                    "absentInfoText": ""
                }
            },
            {
                "dayIndex": 3,
                "hourIndex": 6,
                "atom": {
                    "subject": "TK",
                    "teacher": "Sta",
                    "room": "205",
                    "group": "TK1",
                    "changed": false,
                    "type": "atom",
                    "subjecttext": "Technické kreslení | čt 19.2. | 6 (12:35 - 13:20)",
                    "teacherFull": "Ing. Hana Šťastná",
                    "theme": "MP - průseky obrazců",
                    "notice": "",
                    "changeinfo": "",
                    "homeworks": null,
                    "absencetext": null,
                    "hasAbsent": false,
                    "absentInfoText": ""
                }
            },
            {
                "dayIndex": 3,
                "hourIndex": 7,
                "atom": {
                    "subject": "TK",
                    "teacher": "Sta",
                    "room": "205",
                    "group": "TK1",
                    "changed": false,
                    "type": "atom",
                    "subjecttext": "Technické kreslení | čt 19.2. | 7 (13:25 - 14:10)",
                    "teacherFull": "Ing. Hana Šťastná",
                    "theme": "MP - průseky obrazců",
                    "notice": "",
                    "changeinfo": "",
                    "homeworks": null,
                    "absencetext": null,
                    "hasAbsent": false,
                    "absentInfoText": ""
                }
            },
            {
                "dayIndex": 4,
                "hourIndex": 1,
                "atom": {
                    "subject": "",
                    "teacher": "",
                    "room": "",
                    "group": "",
                    "cancelled": true,
                    "changeinfo": "Zrušeno (AJ, Vrhelová Angelika)"
                }
            },
            {
                "dayIndex": 4,
                "hourIndex": 2,
                "atom": {
                    "subject": "F",
                    "teacher": "Har",
                    "room": "202",
                    "group": "",
                    "changed": false,
                    "type": "atom",
                    "subjecttext": "Fyzika | pá 20.2. | 2 (8:50 - 9:35)",
                    "teacherFull": "Ing. Jan Hartman",
                    "theme": "Grafitační a tíhová síla, tíhové zrychlení na povechu Země",
                    "notice": "",
                    "changeinfo": "",
                    "homeworks": null,
                    "absencetext": null,
                    "hasAbsent": false,
                    "absentInfoText": ""
                }
            },
            {
                "dayIndex": 4,
                "hourIndex": 3,
                "atom": {
                    "subject": "ČJL",
                    "teacher": "Fen",
                    "room": "202",
                    "group": "",
                    "changed": false,
                    "type": "atom",
                    "subjecttext": "Český jazyk a literatura | pá 20.2. | 3 (9:45 - 10:30)",
                    "teacherFull": "Mgr. Věra Fenclová",
                    "theme": "Orientace v textu",
                    "notice": "",
                    "changeinfo": "",
                    "homeworks": null,
                    "absencetext": null,
                    "hasAbsent": false,
                    "absentInfoText": ""
                }
            },
            {
                "dayIndex": 4,
                "hourIndex": 4,
                "atom": {
                    "subject": "PRX",
                    "teacher": "Mrz",
                    "room": "DAUT",
                    "group": "DÍL1",
                    "changed": false,
                    "type": "atom",
                    "subjecttext": "Praxe | pá 20.2. | 4 (10:50 - 11:35)",
                    "teacherFull": "DiS. Michal Mrázek",
                    "theme": "Jednoduchý elektronický obvod",
                    "notice": "",
                    "changeinfo": "",
                    "homeworks": null,
                    "absencetext": null,
                    "hasAbsent": false,
                    "absentInfoText": ""
                }
            },
            {
                "dayIndex": 4,
                "hourIndex": 4,
                "atom": {
                    "subject": "PRX",
                    "teacher": "Črr",
                    "room": "DZAM",
                    "group": "DÍL2",
                    "changed": false,
                    "type": "atom",
                    "subjecttext": "Praxe | pá 20.2. | 4 (10:50 - 11:35)",
                    "teacherFull": "Roman Černý",
                    "theme": "Broušení",
                    "notice": "",
                    "changeinfo": "",
                    "homeworks": null,
                    "absencetext": null,
                    "hasAbsent": false,
                    "absentInfoText": ""
                }
            },
            {
                "dayIndex": 4,
                "hourIndex": 4,
                "atom": {
                    "subject": "PRX",
                    "teacher": "Jur",
                    "room": "DINS",
                    "group": "DÍL3",
                    "changed": false,
                    "type": "atom",
                    "subjecttext": "Praxe | pá 20.2. | 4 (10:50 - 11:35)",
                    "teacherFull": "Matěj Jurčík",
                    "theme": "Revize elektrospotřebičů",
                    "notice": "",
                    "changeinfo": "",
                    "homeworks": null,
                    "absencetext": null,
                    "hasAbsent": false,
                    "absentInfoText": ""
                }
            },
            {
                "dayIndex": 4,
                "hourIndex": 5,
                "atom": {
                    "subject": "PRX",
                    "teacher": "Mrz",
                    "room": "DAUT",
                    "group": "DÍL1",
                    "changed": false,
                    "type": "atom",
                    "subjecttext": "Praxe | pá 20.2. | 5 (11:40 - 12:25)",
                    "teacherFull": "DiS. Michal Mrázek",
                    "theme": "Jednoduchý elektronický obvod",
                    "notice": "",
                    "changeinfo": "",
                    "homeworks": null,
                    "absencetext": null,
                    "hasAbsent": false,
                    "absentInfoText": ""
                }
            },
            {
                "dayIndex": 4,
                "hourIndex": 5,
                "atom": {
                    "subject": "PRX",
                    "teacher": "Črr",
                    "room": "DZAM",
                    "group": "DÍL2",
                    "changed": false,
                    "type": "atom",
                    "subjecttext": "Praxe | pá 20.2. | 5 (11:40 - 12:25)",
                    "teacherFull": "Roman Černý",
                    "theme": "Broušení",
                    "notice": "",
                    "changeinfo": "",
                    "homeworks": null,
                    "absencetext": null,
                    "hasAbsent": false,
                    "absentInfoText": ""
                }
            },
            {
                "dayIndex": 4,
                "hourIndex": 5,
                "atom": {
                    "subject": "PRX",
                    "teacher": "Jur",
                    "room": "DINS",
                    "group": "DÍL3",
                    "changed": false,
                    "type": "atom",
                    "subjecttext": "Praxe | pá 20.2. | 5 (11:40 - 12:25)",
                    "teacherFull": "Matěj Jurčík",
                    "theme": "Revize elektrospotřebičů",
                    "notice": "",
                    "changeinfo": "",
                    "homeworks": null,
                    "absencetext": null,
                    "hasAbsent": false,
                    "absentInfoText": ""
                }
            },
            {
                "dayIndex": 4,
                "hourIndex": 6,
                "atom": {
                    "subject": "PRX",
                    "teacher": "Mrz",
                    "room": "DAUT",
                    "group": "DÍL1",
                    "changed": false,
                    "type": "atom",
                    "subjecttext": "Praxe | pá 20.2. | 6 (12:35 - 13:20)",
                    "teacherFull": "DiS. Michal Mrázek",
                    "theme": "Jednoduchý elektronický obvod",
                    "notice": "",
                    "changeinfo": "",
                    "homeworks": null,
                    "absencetext": null,
                    "hasAbsent": false,
                    "absentInfoText": ""
                }
            },
            {
                "dayIndex": 4,
                "hourIndex": 6,
                "atom": {
                    "subject": "PRX",
                    "teacher": "Črr",
                    "room": "DZAM",
                    "group": "DÍL2",
                    "changed": false,
                    "type": "atom",
                    "subjecttext": "Praxe | pá 20.2. | 6 (12:35 - 13:20)",
                    "teacherFull": "Roman Černý",
                    "theme": "Broušení",
                    "notice": "",
                    "changeinfo": "",
                    "homeworks": null,
                    "absencetext": null,
                    "hasAbsent": false,
                    "absentInfoText": ""
                }
            },
            {
                "dayIndex": 4,
                "hourIndex": 6,
                "atom": {
                    "subject": "PRX",
                    "teacher": "Jur",
                    "room": "DINS",
                    "group": "DÍL3",
                    "changed": false,
                    "type": "atom",
                    "subjecttext": "Praxe | pá 20.2. | 6 (12:35 - 13:20)",
                    "teacherFull": "Matěj Jurčík",
                    "theme": "Revize elektrospotřebičů",
                    "notice": "",
                    "changeinfo": "",
                    "homeworks": null,
                    "absencetext": null,
                    "hasAbsent": false,
                    "absentInfoText": ""
                }
            }
        ]
    },

    // 8.4 Public Events
    events: [
        // --- LEDEN (January) 2026 ---
        {
            id: "evt_j1",
            title: "Novoroční prázdniny",
            description: "Škola uzavřena – státní svátek.",
            dateFrom: "2026-01-01T00:00:00",
            dateTo: "2026-01-01T23:59:59",
            category: "holiday"
        },
        {
            id: "evt_j2",
            title: "Pololetní pedagogická rada",
            description: "Jednání pedagogické rady k uzavření 1. pololetí.",
            dateFrom: "2026-01-22T14:00:00",
            dateTo: "2026-01-22T16:00:00",
            category: "meeting"
        },
        {
            id: "evt_j3",
            title: "Lyžařský výcvik 2.A",
            description: "Lyžařský výcvikový kurz – Šumava.",
            dateFrom: "2026-01-12T00:00:00",
            dateTo: "2026-01-16T23:59:59",
            category: "trip"
        },
        {
            id: "evt_j4",
            title: "Den otevřených dveří",
            description: "Prezentace školy pro budoucí studenty a rodiče.",
            dateFrom: "2026-01-24T09:00:00",
            dateTo: "2026-01-24T15:00:00",
            category: "meeting"
        },
        {
            id: "evt_j5",
            title: "Pololetní prázdniny",
            description: "Jednodenní prázdniny po uzavření 1. pololetí.",
            dateFrom: "2026-01-30T00:00:00",
            dateTo: "2026-01-30T23:59:59",
            category: "holiday"
        },
        // --- ÚNOR (February) 2026 ---
        {
            id: "evt1",
            title: "Třídní schůzky",
            description: "Informace o prospěchu a chování za 3. čtvrtletí.",
            dateFrom: "2026-02-18T16:00:00",
            dateTo: "2026-02-18T18:00:00",
            category: "meeting"
        },
        {
            id: "evt_u18",
            title: "Maturitní maraton příprav",
            description: "Ukázková dlouhá akce pro test vícedenního vykreslení (18 dní).",
            dateFrom: "2026-02-02T00:00:00",
            dateTo: "2026-02-19T23:59:59",
            category: "project"
        },
        {
            id: "evt_u2",
            title: "Školní kolo olympiády v ČJ",
            description: "Soutěž v českém jazyce – školní kolo.",
            dateFrom: "2026-02-05T08:00:00",
            dateTo: "2026-02-05T12:00:00",
            category: "exam"
        },
        {
            id: "evt_u3",
            title: "Exkurze – technické muzeum",
            description: "Návštěva Národního technického muzea v Praze.",
            dateFrom: "2026-02-10T07:00:00",
            dateTo: "2026-02-10T16:00:00",
            category: "trip"
        },
        {
            id: "evt_u4",
            title: "Projektový týden",
            description: "Mezioborový projektový týden – práce ve skupinách.",
            dateFrom: "2026-02-16T00:00:00",
            dateTo: "2026-02-18T23:59:59",
            category: "project"
        },
        {
            id: "evt2",
            title: "Jarní prázdniny",
            description: "Škola uzavřena.",
            dateFrom: "2026-02-23T00:00:00",
            dateTo: "2026-03-01T23:59:59",
            category: "holiday"
        },
        // --- BŘEZEN (March) 2026 ---
        {
            id: "evt3",
            title: "Divadelní představení",
            description: "Návštěva městského divadla – Lakomec.",
            dateFrom: "2026-03-10T08:00:00",
            dateTo: "2026-03-10T12:00:00",
            category: "trip"
        },
        {
            id: "evt_m2",
            title: "Maturitní písemky (ČJ)",
            description: "Písemná práce z českého jazyka pro maturitní ročníky.",
            dateFrom: "2026-03-04T08:00:00",
            dateTo: "2026-03-04T12:00:00",
            category: "exam"
        },
        {
            id: "evt_m3",
            title: "Sportovní den",
            description: "Celodenní sportovní akce – atletika, míčové hry.",
            dateFrom: "2026-03-20T08:00:00",
            dateTo: "2026-03-20T15:00:00",
            category: "trip"
        },
        {
            id: "evt_m4",
            title: "Velikonoční prázdniny",
            description: "Škola uzavřena.",
            dateFrom: "2026-03-30T00:00:00",
            dateTo: "2026-03-31T23:59:59",
            category: "holiday"
        },
        {
            id: "evt_m5",
            title: "Konzultace k maturitě",
            description: "Individuální konzultace s maturujícími studenty.",
            dateFrom: "2026-03-16T00:00:00",
            dateTo: "2026-03-18T23:59:59",
            category: "meeting"
        },
        {
            id: "evt_m6",
            title: "Školní kolo SOČ",
            description: "Prezentace studentských odborných prací.",
            dateFrom: "2026-03-25T08:00:00",
            dateTo: "2026-03-25T16:00:00",
            category: "exam"
        }
    ],

    // 8.5 Staff
    staff: [
        {
            id: "st1",
            firstName: "Jan",
            lastName: "Novák",
            title: "Mgr.",
            email: "jan.novak@skola.cz",
            phone: "+420 123 456 789",
            role: "Ředitel školy",
            consultations: "Středa 14:00 - 15:00"
        },
        {
            id: "st2",
            firstName: "Eva",
            lastName: "Svobodová",
            title: "Ing.",
            email: "eva.svobodova@skola.cz",
            phone: "",
            role: "Zástupce ředitele",
            consultations: "Pondělí 13:00 - 14:00"
        },
        {
            id: "st3",
            firstName: "Petr",
            lastName: "Bílek",
            title: "Bc.",
            email: "petr.bilek@skola.cz",
            phone: "+420 987 654 321",
            role: "Učitel TV, Zemtěpis",
            consultations: "Dle domluvy"
        }
    ],

    logs: [
        "2026-02-15 02:10:03 | auto | events | OK | http=200 | upsert=42",
        "2026-02-15 02:10:05 | auto | timetable_permanent | OK | http=200 | upsert=150",
        "2026-02-15 02:10:21 | manual ip=1.2.3.4 | timetable_actual | ERROR | http=404 | msg=Not found (check web_prefix)",
        "2026-02-14 02:10:01 | auto | events | OK | http=200 | upsert=0"
    ]
};
