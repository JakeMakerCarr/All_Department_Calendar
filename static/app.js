import {
  getApp,
  getApps,
  initializeApp
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import {
  getDatabase,
  onValue,
  push,
  ref,
  remove,
  set
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-database.js";

const DEPARTMENTS = [
  { name: "Corporate Services", color: "#cbdb2c" },
  { name: "Early Years", color: "#e6acce" },
  { name: "Education Advocates", color: "#003a70" },
  { name: "Education Analysts", color: "#5dbcb2" },
  { name: "Mobile Therapeutic Unit", color: "#0b8bcc" },
  { name: "Nutrition", color: "#e6544e" }
];

const CALENDAR_EVENTS_PATH = "calendarEvents";
const TRAVEL_DECLARATIONS_PATH = "travelDeclarations";

// Set this to the 4-number Safety PIN YFNED staff should use for saves and deletes.
const SAFETY_PIN = "6962";

const APP_MODE = document.body.dataset.appMode || "calendar";
const APP_CONFIG = APP_MODE === "travel"
  ? {
      dbPath: TRAVEL_DECLARATIONS_PATH,
      entityLabel: "travel declaration",
      allTitle: "YFNED ALL DEPARTMENTS TRAVEL CALENDAR",
      singleTitle: (departmentName) => `${departmentName} TRAVEL CALENDAR`,
      customTitle: "YFNED CUSTOM TRAVEL VIEW",
      emptySelectedDay: "No travel declarations are scheduled for the selected day.",
      pickDate: "Click any date on the calendar to view travel declarations.",
      chooseDateLead: "Travel declarations that overlap the selected date will appear here.",
      selectedDayLead: (count) => `${count} travel declaration${count === 1 ? "" : "s"} overlap this date.`,
      deleteLabel: "Delete Travel Declaration",
      firebaseLoading: "Firebase connected. Travel declarations are loading from Realtime Database.",
      firebaseEmpty: "Firebase connected. No stored travel declarations yet.",
      firebaseLoaded: (count) => `Firebase connected. Loaded ${count} travel declaration${count === 1 ? "" : "s"} from Realtime Database.`,
      firebaseDelete: "Travel declaration removed from Firebase Realtime Database.",
      firebaseSave: "Travel declaration saved to Firebase Realtime Database.",
      firebaseMissing: "Firebase is not configured yet, so there is no stored travel declaration to remove.",
      formMissing: "Please complete every travel field before saving."
    }
  : {
      dbPath: CALENDAR_EVENTS_PATH,
      entityLabel: "event",
      allTitle: "YFNED ALL DEPARTMENTS CALENDAR",
      singleTitle: (departmentName) => `${departmentName} CALENDAR`,
      customTitle: "YFNED CUSTOM CALENDAR VIEW",
      emptySelectedDay: "No events are scheduled for the selected day.",
      pickDate: "Click any date on the calendar to view events.",
      chooseDateLead: "Events that overlap the selected date will appear here.",
      selectedDayLead: (count) => `${count} event${count === 1 ? "" : "s"} overlap this date.`,
      deleteLabel: "Delete Event",
      firebaseLoading: "Firebase connected. Events are loading from Realtime Database.",
      firebaseEmpty: "Firebase connected. No stored events yet.",
      firebaseLoaded: (count) => `Firebase connected. Loaded ${count} event${count === 1 ? "" : "s"} from Realtime Database.`,
      firebaseDelete: "Event removed from Firebase Realtime Database.",
      firebaseSave: "Event saved to Firebase Realtime Database.",
      firebaseMissing: "Firebase is not configured yet, so there is no stored event to remove.",
      formMissing: "Please complete every event field before saving."
    };

const SUB_DEPARTMENTS = {
  "Corporate Services": [
    "Finance",
    "Communications",
    "Human Resources",
    "I.T. Team"
  ],
  "Early Years": [
    "IELCC",
    "YG Training"
  ],
  "Education Advocates": [
    "High School",
    "Primary"
  ],
  "Education Analysts": [
    "Adult Education",
    "Numeracy",
    "Trades"
  ],
  "Mobile Therapeutic Unit": [
    "Wellness Team",
    "Allied Health"
  ],
  "Nutrition": [
    "Urban",
    "Rural"
  ]
};

const FLOWER_NAV_CONFIG = {
  all: {
    label: "All Departments",
    image: "Assets/NavigationFlower/AllDepartments_FlowerCenter.png"
  },
  departments: {
    "Education Advocates": {
      className: "flower-petal-advocates",
      image: "Assets/NavigationFlower/EduacationAdvocates/EducationAdvocates_TopPetal.png",
      hoverImage: "Assets/NavigationFlower/EduacationAdvocates/EducationAdvocates_TopPetalText.png"
    },
    "Early Years": {
      className: "flower-petal-early-years",
      image: "Assets/NavigationFlower/EarlyYears/EarlyYears_TopPetal.png",
      hoverImage: "Assets/NavigationFlower/EarlyYears/EarlyYears_TopPetalText.png"
    },
    "Nutrition": {
      className: "flower-petal-nutrition",
      image: "Assets/NavigationFlower/Nutrition/Nutrition_TopPetal.png",
      hoverImage: "Assets/NavigationFlower/Nutrition/Nutrition_TopPetalText.png"
    },
    "Mobile Therapeutic Unit": {
      className: "flower-petal-mtu",
      image: "Assets/NavigationFlower/MobileTherapeuticUnit/MobileTherapeuticUnit_TopPetal.png",
      hoverImage: "Assets/NavigationFlower/MobileTherapeuticUnit/MobileTherapeuticUnit_TopPetalText.png"
    },
    "Education Analysts": {
      className: "flower-petal-analysts",
      image: "Assets/NavigationFlower/EducationsAnalysts/EducationAnalysts_TopPetal.png",
      hoverImage: "Assets/NavigationFlower/EducationsAnalysts/EducationAnalysts_TopPetalText.png"
    },
    "Corporate Services": {
      className: "flower-stem-corporate",
      image: "Assets/NavigationFlower/CorporateServices/CorporateServices_Stem.png",
      hoverImage: "Assets/NavigationFlower/CorporateServices/CorporateServices_StemText.png"
    }
  }
};

const SUB_DEPARTMENT_ASSETS = {
  "Corporate Services": {
    "Finance": "Assets/NavigationFlower/CorporateServices/CorporateServices_Finance.png",
    "Communications": "Assets/NavigationFlower/CorporateServices/CorporateServices_Communications.png",
    "Human Resources": "Assets/NavigationFlower/CorporateServices/CorporateServices_HumanResources.png",
    "I.T. Team": "Assets/NavigationFlower/CorporateServices/CorporateServices_ITTeam.png"
  },
  "Early Years": {
    "IELCC": "Assets/NavigationFlower/EarlyYears/EarlyYears_IELCC.png",
    "YG Training": "Assets/NavigationFlower/EarlyYears/EarlyYears_YG-Training.png"
  },
  "Education Advocates": {
    "Adult Education": null,
    "High School": "Assets/NavigationFlower/EduacationAdvocates/EducationAdvocates_SecondarySchool.png",
    "Primary": "Assets/NavigationFlower/EduacationAdvocates/EducationAdvocates_PrimarySchool.png"
  },
  "Education Analysts": {
    "Adult Education": "Assets/NavigationFlower/EducationsAnalysts/EducationAnalysts_AdultEducation.png",
    "Numeracy": "Assets/NavigationFlower/EducationsAnalysts/EducationAnalysts_Numeracy.png",
    "Trades": "Assets/NavigationFlower/EducationsAnalysts/EducationAnalysts_Trades.png"
  },
  "Mobile Therapeutic Unit": {
    "Wellness Team": "Assets/NavigationFlower/MobileTherapeuticUnit/MobileTherapeuticUnit_Wellness.png",
    "Allied Health": "Assets/NavigationFlower/MobileTherapeuticUnit/MobileTherapeuticUnit_AlliedHealth.png"
  },
  "Nutrition": {
    "Urban": "Assets/NavigationFlower/Nutrition/Nutrition_UrbanNutrition.png",
    "Rural": "Assets/NavigationFlower/Nutrition/Nutrition_RuralNutrition.png"
  }
};

const SUB_DEPARTMENT_HOVER_ASSETS = {
  "Corporate Services": {
    "Finance": "Assets/NavigationFlower/CorporateServices/CorporateServices_FinanceText.png",
    "Communications": "Assets/NavigationFlower/CorporateServices/CorporateServices_CommunicationsText.png",
    "Human Resources": "Assets/NavigationFlower/CorporateServices/CorporateServices_HumanResourcesText.png",
    "I.T. Team": "Assets/NavigationFlower/CorporateServices/CorporateServices_ITTeamText.png"
  }
};

const SUB_DEPARTMENT_SELECTED_ASSETS = {
  "Corporate Services": {
    "Finance": "Assets/NavigationFlower/CorporateServices/CorporateServices_Finance_Selected.png",
    "Communications": "Assets/NavigationFlower/CorporateServices/CorporateServices_Communications_Selected.png",
    "Human Resources": "Assets/NavigationFlower/CorporateServices/CorporateServices_HumanResources_Selected.png",
    "I.T. Team": "Assets/NavigationFlower/CorporateServices/CorporateServices_ITTeam_Selected.png"
  },
  "Early Years": {
    "IELCC": "Assets/NavigationFlower/EarlyYears/EarlyYears_IELCC_Selected.png",
    "YG Training": "Assets/NavigationFlower/EarlyYears/EarlyYears_YG-Training_Selected.png"
  },
  "Education Advocates": {
    "High School": "Assets/NavigationFlower/EduacationAdvocates/EducationAdvocates_SecondarySchool_Selected.png",
    "Primary": "Assets/NavigationFlower/EduacationAdvocates/EducationAdvocates_PrimarySchool_Selected.png"
  },
  "Education Analysts": {
    "Adult Education": "Assets/NavigationFlower/EducationsAnalysts/EducationAnalysts_AdultEducation_Selected.png",
    "Trades": "Assets/NavigationFlower/EducationsAnalysts/EducationAnalysts_Trades_Selected.png",
    "Numeracy": "Assets/NavigationFlower/EducationsAnalysts/EducationAnalysts_Numeracy_Selected.png"
  },
  "Mobile Therapeutic Unit": {
    "Wellness Team": "Assets/NavigationFlower/MobileTherapeuticUnit/MobileTherapeuticUnit_Wellness_Selected.png",
    "Allied Health": "Assets/NavigationFlower/MobileTherapeuticUnit/MobileTherapeuticUnit_AlliedHealth_Selected.png"
  },
  "Nutrition": {
    "Urban": "Assets/NavigationFlower/Nutrition/Nutrition_UrbanNutrition_Selected.png",
    "Rural": "Assets/NavigationFlower/Nutrition/Nutrition_RuralNutrition_Selected.png"
  }
};

const SUB_DEPARTMENT_LAYOUTS = {
  "Early Years": {
    "IELCC": { left: "calc(68% + 8px)", top: "calc(10% - 6px)", width: "36%", rotate: 0 },
    "YG Training": { left: "calc(72% + 10px)", top: "calc(24% - 6px)", width: "35%", rotate: 6 }
  },
  "Education Analysts": {
    "Adult Education": { left: "calc(-8% + 2px)", top: "calc(0.5% - 4px)", width: "40%", rotate: 0 },
    "Trades": { left: "calc(-11% + 2px)", top: "calc(0.5% + 52px)", width: "40%", rotate: 0 },
    "Numeracy": { left: "calc(-13% + 2px)", top: "calc(0.5% + 141px)", width: "40%", rotate: 0 }
  },
  "Education Advocates": {
    "High School": { left: "calc(10% + 13px)", top: "calc(0.5% - 18px)", width: "38%", rotate: 0 },
    "Primary": { left: "calc(53% - 13px)", top: "calc(0.5% - 18px)", width: "38%", rotate: 0 }
  },
  "Nutrition": {
    "Urban": { left: "calc(60% + 18px)", top: "calc(37% + 8px)", width: "39%", rotate: 0 },
    "Rural": { left: "calc(58% - 32px)", top: "calc(37% + 43px)", width: "39%", rotate: 15 }
  },
  "Mobile Therapeutic Unit": {
    "Wellness Team": { left: "calc(-6% + 23px)", top: "calc(37% + 8px)", width: "39%", rotate: 0 },
    "Allied Health": { left: "calc(20% - 12px)", top: "calc(37% + 46px)", width: "39%", rotate: 0 }
  },
  "Corporate Services": {
    "Finance": { left: "calc(4% + 20px)", top: "calc(66% + 40px)", width: "26.4%", rotate: 0 },
    "Communications": { left: "calc(60% - 30px)", top: "calc(66% + 65px)", width: "26.4%", rotate: 0 },
    "Human Resources": { left: "59%", top: "calc(79% + 55px)", width: "26.4%", rotate: 0 },
    "I.T. Team": { left: "calc(3% + 50px)", top: "calc(82% + 30px)", width: "26.4%", rotate: 0 }
  }
};

const WEEKDAY_SHORT_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const DEFAULT_FLOWER_SUBPETALS = [
  { department: "Corporate Services", subDepartment: "Communications" },
  { department: "Corporate Services", subDepartment: "Finance" },
  { department: "Corporate Services", subDepartment: "Human Resources" },
  { department: "Corporate Services", subDepartment: "I.T. Team" }
];

const SAMPLE_EVENTS = [
  {
    title: "Budget Planning Retreat",
    department: "Corporate Services",
    subDepartment: "",
    start: "2026-04-06",
    end: "2026-04-09",
    description: "Quarterly planning sessions with leadership and operations."
  },
  {
    title: "Payroll Processing",
    department: "Corporate Services",
    subDepartment: "Finance",
    start: "2026-04-24",
    end: "2026-04-24",
    description: "Internal payroll approvals and remittance preparation."
  },
  {
    title: "Spring Family Learning Camp",
    department: "Early Years",
    start: "2026-04-13",
    end: "2026-04-17",
    description: "Multi-day literacy and family programming sessions."
  },
  {
    title: "Educator Sharing Circle",
    department: "Early Years",
    start: "2026-04-28",
    end: "2026-04-28",
    description: "Monthly gathering with partner educators."
  },
  {
    title: "Student Case Review",
    department: "Education Advocates",
    subDepartment: "High School",
    start: "2026-04-08",
    end: "2026-04-10",
    description: "Cross-community review of active student support plans."
  },
  {
    title: "Community Outreach Travel",
    department: "Education Advocates",
    subDepartment: "High School",
    start: "2026-04-21",
    end: "2026-04-23",
    description: "Regional travel to meet families and school teams."
  },
  {
    title: "Data Reporting Window",
    department: "Education Analysts",
    subDepartment: "Numeracy",
    start: "2026-04-14",
    end: "2026-04-16",
    description: "Consolidated reporting period for monthly dashboards."
  },
  {
    title: "Power BI Workshop",
    department: "Education Analysts",
    subDepartment: "Trades",
    start: "2026-04-29",
    end: "2026-04-29",
    description: "Training and dashboard governance session."
  },
  {
    title: "Therapeutic Unit Community Clinic",
    department: "Mobile Therapeutic Unit",
    subDepartment: "Wellness Team",
    start: "2026-04-07",
    end: "2026-04-11",
    description: "Clinical appointments and therapeutic programming."
  },
  {
    title: "Interdisciplinary Case Conference",
    department: "Mobile Therapeutic Unit",
    subDepartment: "Allied Health",
    start: "2026-04-22",
    end: "2026-04-22",
    description: "Support team coordination for active care plans."
  },
  {
    title: "Menu Cycle Rollout",
    department: "Nutrition",
    start: "2026-04-01",
    end: "2026-04-03",
    description: "Launch of the new nutrition and kitchen planning cycle."
  },
  {
    title: "School Nutrition Workshop",
    department: "Nutrition",
    subDepartment: "Urban",
    start: "2026-04-22",
    end: "2026-04-24",
    description: "Hands-on workshop with school partners and kitchen teams."
  }
];

const SAMPLE_TRAVEL_DECLARATIONS = [
  {
    title: "Avery Smith",
    department: "Corporate Services",
    subDepartment: "Finance",
    location: "Whitehorse to Dawson City",
    start: "2026-04-06",
    end: "2026-04-08",
    description: "Budget planning visit and finance coordination meetings."
  },
  {
    title: "Talia Johnson",
    department: "Education Advocates",
    subDepartment: "High School",
    location: "Watson Lake",
    start: "2026-04-10",
    end: "2026-04-12",
    description: "Family meetings and student support follow-up."
  },
  {
    title: "Chris Peter",
    department: "Education Analysts",
    subDepartment: "Numeracy",
    location: "Mayo",
    start: "2026-04-14",
    end: "2026-04-15",
    description: "School data review and numeracy planning sessions."
  },
  {
    title: "Jordan Charlie",
    department: "Mobile Therapeutic Unit",
    subDepartment: "Wellness Team",
    location: "Old Crow",
    start: "2026-04-18",
    end: "2026-04-21",
    description: "Travel clinic and wellness support programming."
  },
  {
    title: "Robin James",
    department: "Nutrition",
    subDepartment: "Urban",
    location: "Haines Junction",
    start: "2026-04-22",
    end: "2026-04-24",
    description: "Kitchen planning visits and community nutrition workshops."
  }
];

const departmentMap = new Map(DEPARTMENTS.map((department) => [department.name, department]));
const selectedSubDepartments = new Map(
  Object.entries(SUB_DEPARTMENTS).map(([department, subDepartments]) => [
    department,
    new Set(subDepartments)
  ])
);

let selectedDepartments = new Set(DEPARTMENTS.map((department) => department.name));
let activeNavDepartment = null;
let activeDate = null;
let selectedDayCell = null;
let allEvents = [];
let db = null;
let firebaseReady = false;
let calendar = null;
let appStarted = false;
let safetyPinDialogEl = null;
let pendingSafetyPinResolve = null;

const titleEl = document.getElementById("calendar-title");
const chipsEl = document.getElementById("active-chips");
const dayHeadingEl = document.getElementById("selected-day-heading");
const daySubtitleEl = document.getElementById("selected-day-subtitle");
const dayEventsEl = document.getElementById("selected-day-events");
const togglesHost = document.getElementById("department-toggles");
const departmentSelectEl = document.getElementById("event-department");
const subDepartmentSelectEl = document.getElementById("event-subdepartment");
const eventFormEl = document.getElementById("event-form");
const eventTitleEl = document.getElementById("event-title");
const eventStartEl = document.getElementById("event-start");
const eventEndEl = document.getElementById("event-end");
const eventDescriptionEl = document.getElementById("event-description");
const eventLocationEl = document.getElementById("event-location");
const eventForWhatEventEl = document.getElementById("event-for-what-event");
const eventIntegrateCalendarEl = document.getElementById("event-integrate-calendar");
const calendarIntegrationFieldsEl = document.getElementById("calendar-integration-fields");
const travelIntegrationFieldsEl = document.getElementById("travel-integration-fields");
const eventTravelerNameEl = document.getElementById("event-traveler-name");
const eventTravelLocationEl = document.getElementById("event-travel-location");
const eventSeriesFieldsetEl = document.getElementById("event-series-fieldset");
const weekdayPickerEl = document.getElementById("weekday-picker");
const dataStatusEl = document.getElementById("data-status");
const weekdayCheckboxEls = Array.from(
  weekdayPickerEl?.querySelectorAll('input[type="checkbox"]') || []
);

function parseLocalDate(dateString) {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatDateInputValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function getSelectedWeekdays() {
  return weekdayCheckboxEls
    .filter((checkbox) => checkbox.checked)
    .map((checkbox) => Number(checkbox.value))
    .sort((left, right) => left - right);
}

function formatWeekdayList(weekdayNumbers) {
  if (!weekdayNumbers.length) {
    return "";
  }

  return weekdayNumbers.map((weekday) => WEEKDAY_SHORT_LABELS[weekday]).join(", ");
}

function buildEventSpans(start, end, weekdayNumbers) {
  if (!weekdayNumbers.length) {
    return [{ start, end }];
  }

  const rangeEnd = parseLocalDate(end);
  const selectedWeekdays = new Set(weekdayNumbers);
  const matchingDates = [];

  for (let cursor = parseLocalDate(start); cursor <= rangeEnd; cursor = addDays(cursor, 1)) {
    if (selectedWeekdays.has(cursor.getDay())) {
      matchingDates.push(new Date(cursor));
    }
  }

  if (!matchingDates.length) {
    return [];
  }

  const spans = [];
  let spanStart = matchingDates[0];
  let previousDate = matchingDates[0];

  for (let index = 1; index < matchingDates.length; index += 1) {
    const currentDate = matchingDates[index];
    const expectedNextDate = addDays(previousDate, 1);

    if (normalizeDate(currentDate).getTime() !== normalizeDate(expectedNextDate).getTime()) {
      spans.push({
        start: formatDateInputValue(spanStart),
        end: formatDateInputValue(previousDate)
      });
      spanStart = currentDate;
    }

    previousDate = currentDate;
  }

  spans.push({
    start: formatDateInputValue(spanStart),
    end: formatDateInputValue(previousDate)
  });

  return spans;
}

function isFirebaseConfigured() {
  const config = window.YFNED_FIREBASE_CONFIG;
  if (!config) return false;

  return Object.values(config).every((value) => typeof value === "string" && !value.includes("REPLACE_ME"));
}

function setStatus(message, tone = "info") {
  dataStatusEl.textContent = message;
  dataStatusEl.dataset.tone = tone;
}

function resolveSafetyPinDialog(isApproved) {
  if (!pendingSafetyPinResolve) {
    return;
  }

  const resolve = pendingSafetyPinResolve;
  pendingSafetyPinResolve = null;
  resolve(isApproved);
}

function createSafetyPinDialog() {
  if (safetyPinDialogEl) {
    return safetyPinDialogEl;
  }

  safetyPinDialogEl = document.createElement("dialog");
  safetyPinDialogEl.className = "safety-pin-dialog";
  safetyPinDialogEl.innerHTML = `
    <form class="safety-pin-form">
      <h2>What is the Safety PIN?</h2>
      <input
        class="safety-pin-input"
        type="password"
        inputmode="numeric"
        autocomplete="off"
        maxlength="4"
        pattern="[0-9]{4}"
        aria-label="Safety PIN"
      >
      <p class="safety-pin-error" role="alert" aria-live="polite"></p>
      <button type="submit" class="primary-action">Submit</button>
    </form>
  `;
  document.body.appendChild(safetyPinDialogEl);

  const form = safetyPinDialogEl.querySelector(".safety-pin-form");
  const input = safetyPinDialogEl.querySelector(".safety-pin-input");
  const error = safetyPinDialogEl.querySelector(".safety-pin-error");

  input.addEventListener("input", () => {
    input.value = input.value.replace(/\D/g, "").slice(0, 4);
    error.textContent = "";
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (input.value === SAFETY_PIN) {
      safetyPinDialogEl.close();
      resolveSafetyPinDialog(true);
      return;
    }

    error.textContent = "Contact YFNED IT Team for PIN";
    input.focus();
    input.select();
  });

  safetyPinDialogEl.addEventListener("cancel", (event) => {
    event.preventDefault();
    safetyPinDialogEl.close();
    resolveSafetyPinDialog(false);
  });

  return safetyPinDialogEl;
}

function requestSafetyPin() {
  const dialog = createSafetyPinDialog();
  const input = dialog.querySelector(".safety-pin-input");
  const error = dialog.querySelector(".safety-pin-error");

  if (dialog.open) {
    return Promise.resolve(false);
  }

  input.value = "";
  error.textContent = "";

  return new Promise((resolve) => {
    pendingSafetyPinResolve = resolve;
    dialog.showModal();
    input.focus();
  });
}

function syncCalendarIntegrationFields(clearWhenHidden = false) {
  if (!calendarIntegrationFieldsEl && !travelIntegrationFieldsEl) {
    return;
  }

  const isIntegrated = Boolean(eventIntegrateCalendarEl?.checked);
  if (calendarIntegrationFieldsEl) {
    calendarIntegrationFieldsEl.hidden = !isIntegrated;
  }
  if (travelIntegrationFieldsEl) {
    travelIntegrationFieldsEl.hidden = !isIntegrated;
  }

  if (!isIntegrated && clearWhenHidden) {
    if (eventForWhatEventEl) {
      eventForWhatEventEl.value = "";
    }
    if (eventTravelerNameEl) {
      eventTravelerNameEl.value = "";
    }
    if (eventTravelLocationEl) {
      eventTravelLocationEl.value = "";
    }
  }
}

function populateDepartmentOptions() {
  departmentSelectEl.innerHTML = DEPARTMENTS
    .map((department) => `<option value="${department.name}">${department.name}</option>`)
    .join("");
}

function populateSubDepartmentOptions() {
  const subDepartments = SUB_DEPARTMENTS[departmentSelectEl.value] || [];
  if (!subDepartmentSelectEl) return;

  if (!subDepartments.length) {
    subDepartmentSelectEl.innerHTML = '<option value="">No sub-department</option>';
    subDepartmentSelectEl.disabled = true;
    return;
  }

  subDepartmentSelectEl.disabled = false;
  subDepartmentSelectEl.innerHTML = [
    '<option value="">General department</option>',
    ...subDepartments.map((subDepartment) => `<option value="${subDepartment}">${subDepartment}</option>`)
  ].join("");
}

function createToggleMarkup() {
  togglesHost.innerHTML = `
    <div class="flower-nav">
      <div class="flower-stage">
        <div class="flower-subpetal-layer" id="flower-subpetal-layer"></div>
        <button
          type="button"
          class="flower-button flower-center-button"
          data-action-role="all"
          aria-label="${FLOWER_NAV_CONFIG.all.label}"
        >
          <img src="${FLOWER_NAV_CONFIG.all.image}" alt="${FLOWER_NAV_CONFIG.all.label}">
        </button>
        ${Object.entries(FLOWER_NAV_CONFIG.departments).map(([departmentName, config]) => `
          <button
            type="button"
            class="flower-button ${config.className}"
            data-action-role="department"
            data-department="${departmentName}"
            aria-label="${departmentName}"
          >
            <img class="flower-image-base" src="${config.image}" alt="">
            <img class="flower-image-hover" src="${config.hoverImage}" alt="${departmentName}">
          </button>
        `).join("")}
      </div>
      <div class="flower-state-inputs" aria-hidden="true">
        <input type="checkbox" checked data-role="all">
        ${DEPARTMENTS.map((department) => `
          <input type="checkbox" checked data-role="department" data-department="${department.name}">
        `).join("")}
        ${Object.entries(SUB_DEPARTMENTS).flatMap(([department, subDepartments]) =>
          subDepartments.map((subDepartment) => `
            <input
              type="checkbox"
              checked
              data-role="subdepartment"
              data-department="${department}"
              data-subdepartment="${subDepartment}"
            >
          `)
        ).join("")}
      </div>
    </div>
  `;

  renderSubDepartmentFlower();
}

function renderSubDepartmentFlower() {
  const subLayer = document.getElementById("flower-subpetal-layer");
  if (!subLayer) return;

  const activeDepartment = activeNavDepartment || "Corporate Services";
  const showDefaultCorporateFlower = !activeNavDepartment;
  const activeEntries = showDefaultCorporateFlower
    ? []
    : (SUB_DEPARTMENTS[activeDepartment] || []).map((subDepartment) => ({
        department: activeDepartment,
        subDepartment
      }));
  const entries = showDefaultCorporateFlower
    ? DEFAULT_FLOWER_SUBPETALS
    : activeDepartment === "Corporate Services"
      ? activeEntries
      : [
          ...DEFAULT_FLOWER_SUBPETALS,
          ...activeEntries
        ];

  if (!entries.length) {
    subLayer.innerHTML = "";
    return;
  }

  const useExpandedCorporateTextState =
    activeDepartment === "Corporate Services" && !showDefaultCorporateFlower;
  subLayer.classList.toggle(
    "is-behind-main-petals",
    activeDepartment === "Early Years" ||
    activeDepartment === "Education Advocates" ||
    activeDepartment === "Education Analysts" ||
    activeDepartment === "Mobile Therapeutic Unit" ||
    activeDepartment === "Nutrition"
  );
  subLayer.classList.toggle(
    "is-above-stem",
    activeDepartment === "Mobile Therapeutic Unit" || activeDepartment === "Nutrition"
  );

  subLayer.innerHTML = entries.map(({ department, subDepartment }) => {
    const imageSrc = SUB_DEPARTMENT_ASSETS[department]?.[subDepartment];
    const hoverImageSrc = SUB_DEPARTMENT_HOVER_ASSETS[department]?.[subDepartment];
    const selectedImageSrc = SUB_DEPARTMENT_SELECTED_ASSETS[department]?.[subDepartment];
    const layouts = SUB_DEPARTMENT_LAYOUTS[department] || {};
    const departmentColor = departmentMap.get(department)?.color || "#003a70";
    const displayImageSrc =
      useExpandedCorporateTextState && department === "Corporate Services" && hoverImageSrc
        ? hoverImageSrc
        : imageSrc;
    const displayHoverImageSrc =
      useExpandedCorporateTextState && department === "Corporate Services"
        ? null
        : hoverImageSrc;
    const layout = layouts[subDepartment] || { left: "10%", top: "10%", width: "30%", rotate: 0 };
    return `
      <button
        type="button"
        class="flower-subpetal ${displayImageSrc ? "has-image" : "is-text"} ${useExpandedCorporateTextState && department === "Corporate Services" ? "is-expanded-text-state" : ""} ${(
          department !== "Corporate Services" && (
            activeDepartment === "Early Years" ||
            activeDepartment === "Education Advocates" ||
            activeDepartment === "Education Analysts" ||
            activeDepartment === "Mobile Therapeutic Unit" ||
            activeDepartment === "Nutrition"
          )
        ) ? "is-back-petal" : ""}"
        data-action-role="subdepartment"
        data-department="${department}"
        data-subdepartment="${subDepartment}"
        style="
          --subdepartment-color:${departmentColor};
          --sub-left:${layout.left};
          --sub-top:${layout.top};
          --sub-width:${layout.width};
          --sub-rotate:${layout.rotate}deg;
        "
        aria-label="${subDepartment}"
      >
        ${displayImageSrc
          ? `
            <img class="flower-image-base" src="${displayImageSrc}" alt="${subDepartment}">
            ${selectedImageSrc ? `<img class="flower-image-selected" src="${selectedImageSrc}" alt="${subDepartment}">` : ""}
            ${displayHoverImageSrc ? `<img class="flower-image-hover" src="${displayHoverImageSrc}" alt="${subDepartment}">` : ""}
          `
          : `<span>${subDepartment}</span>`}
      </button>
    `;
  }).join("");
}

function normalizeStoredEvents(rawEvents) {
  return rawEvents.map((event) => {
    const department = departmentMap.get(event.department);
    const adjustedEnd = addDays(parseLocalDate(event.end), 1);
    const calendarTitle = APP_MODE === "travel" && event.location
      ? `${event.title} is in ${event.location}`
      : event.title;

    return {
      ...event,
      title: calendarTitle,
      originalTitle: event.title,
      backgroundColor: department?.color || "#355c7d",
      borderColor: department?.color || "#355c7d",
      textColor: "#ffffff",
      endExclusive: formatDateInputValue(adjustedEnd)
    };
  });
}

function getFilteredEvents() {
  return normalizeStoredEvents(
    allEvents.filter((event) => {
      if (!selectedDepartments.has(event.department)) {
        return false;
      }

      const subDepartments = SUB_DEPARTMENTS[event.department] || [];
      if (!subDepartments.length || !event.subDepartment) {
        return true;
      }

      return selectedSubDepartments.get(event.department)?.has(event.subDepartment);
    })
  ).map((event) => ({
    ...event,
    end: event.endExclusive
  }));
}

function formatSelectedSummary() {
  if (selectedDepartments.size === DEPARTMENTS.length) {
    return "All six department calendars are visible.";
  }

  if (selectedDepartments.size === 0) {
    return "No department layers are visible.";
  }

  if (selectedDepartments.size === 1) {
    return `${Array.from(selectedDepartments)[0]} is the active calendar layer.`;
  }

  return `${selectedDepartments.size} department layers are currently overlaid.`;
}

function updateHeaderTitle() {
  if (selectedDepartments.size === DEPARTMENTS.length) {
    titleEl.textContent = APP_CONFIG.allTitle;
    return;
  }

  if (selectedDepartments.size === 1) {
    titleEl.textContent = APP_CONFIG.singleTitle(Array.from(selectedDepartments)[0]);
    return;
  }

  titleEl.textContent = APP_CONFIG.customTitle;
}

function updateActiveChips() {
  chipsEl.innerHTML = "";

  Array.from(selectedDepartments).forEach((departmentName) => {
    const department = departmentMap.get(departmentName);
    if (!department) return;

    const chip = document.createElement("span");
    chip.className = "toolbar-chip";
    chip.innerHTML = `
      <span class="chip-swatch" style="background:${department.color}"></span>
      <span>${department.name}</span>
    `;
    chipsEl.appendChild(chip);
  });
}

function syncToggleInputs() {
  const inputs = togglesHost.querySelectorAll("input[type='checkbox']");
  inputs.forEach((input) => {
    if (input.dataset.role === "all") {
      input.checked = selectedDepartments.size === DEPARTMENTS.length;
      return;
    }
    if (input.dataset.role === "subdepartment") {
      input.checked = selectedSubDepartments
        .get(input.dataset.department)
        ?.has(input.dataset.subdepartment) || false;
      return;
    }
    input.checked = selectedDepartments.has(input.dataset.department);
  });
  const allButton = togglesHost.querySelector('[data-action-role="all"]');
  if (allButton) {
    allButton.classList.toggle("is-active", selectedDepartments.size === DEPARTMENTS.length);
  }

  togglesHost.querySelectorAll('[data-action-role="department"]').forEach((button) => {
    const department = button.dataset.department;
    button.classList.toggle("is-active", false);
    button.classList.toggle("is-focused", activeNavDepartment === department);
  });

  togglesHost.querySelectorAll('[data-action-role="subdepartment"]').forEach((button) => {
    const department = button.dataset.department;
    const subDepartment = button.dataset.subdepartment;
    button.classList.toggle(
      "is-selected",
      !(selectedSubDepartments.get(department)?.has(subDepartment) || false)
    );
    button.classList.remove("is-active");
  });
}

function updateViewCopy() {
  updateHeaderTitle();
  updateActiveChips();
  renderSubDepartmentFlower();
  syncToggleInputs();
  togglesHost.dispatchEvent(new CustomEvent("yfned:filters-changed"));
}

function normalizeDate(dateLike) {
  const date = new Date(dateLike);
  date.setHours(0, 0, 0, 0);
  return date;
}

async function saveEventRecords(records, dbPath = APP_CONFIG.dbPath) {
  const eventsRef = ref(db, dbPath);
  const seriesId = records.length > 1 || records[0].recurrenceWeekdays?.length
    ? push(eventsRef).key
    : "";

  const savedRecords = await Promise.all(records.map(async (record, index) => {
    const newEventRef = push(eventsRef);
    const storedRecord = {
      department: record.department,
      subDepartment: record.subDepartment,
      title: record.title,
      location: record.location,
      start: record.start,
      end: record.end,
      description: record.description,
      createdAt: new Date().toISOString()
    };

    if (seriesId) {
      storedRecord.seriesId = seriesId;
      storedRecord.occurrenceIndex = index;
      storedRecord.occurrenceCount = records.length;
    }

    if (record.recurrenceWeekdays?.length) {
      storedRecord.recurrenceWeekdays = record.recurrenceWeekdays;
    }

    await set(newEventRef, storedRecord);

    return {
      id: newEventRef.key,
      ...storedRecord
    };
  }));

  return savedRecords;
}

function buildCalendarDescriptionFromTravel(travelerName, travelNotes) {
  return [
    `Travel declared by ${travelerName}.`,
    travelNotes
  ].filter(Boolean).join(" ");
}

function buildTravelDescriptionFromEvent(eventTitle, eventDescription) {
  return [
    `Traveling for ${eventTitle}.`,
    eventDescription
  ].filter(Boolean).join(" ");
}

function formatMirrorSaveSummary(records, singularLabel, pluralLabel) {
  if (!records.length) {
    return "";
  }

  return ` Also added ${records.length} ${records.length === 1 ? singularLabel : pluralLabel}.`;
}

function formatLongDate(dateLike) {
  return new Intl.DateTimeFormat("en-CA", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  }).format(new Date(dateLike));
}

function eventSpansDate(event, date) {
  const start = normalizeDate(parseLocalDate(event.start));
  const endExclusive = normalizeDate(parseLocalDate(event.endExclusive));
  return date >= start && date < endExclusive;
}

function formatDateRange(event) {
  const start = parseLocalDate(event.start);
  const endInclusive = addDays(parseLocalDate(event.endExclusive), -1);
  const formatter = new Intl.DateTimeFormat("en-CA", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });

  const startLabel = formatter.format(start);
  const endLabel = formatter.format(endInclusive);
  return startLabel === endLabel ? startLabel : `${startLabel} to ${endLabel}`;
}

async function deleteEvent(eventId) {
  const pinApproved = await requestSafetyPin();
  if (!pinApproved) {
    return;
  }

  if (!firebaseReady || !db) {
    setStatus(APP_CONFIG.firebaseMissing, "warning");
    return;
  }

  await remove(ref(db, `${APP_CONFIG.dbPath}/${eventId}`));
  setStatus(APP_CONFIG.firebaseDelete, "success");
}

function renderSelectedDay(dateLike) {
  if (!dateLike) {
    dayHeadingEl.textContent = "Choose a date";
    daySubtitleEl.textContent = APP_CONFIG.chooseDateLead;
    dayEventsEl.innerHTML = `<p class="empty-state">${APP_CONFIG.pickDate}</p>`;
    return;
  }

  const selectedDate = normalizeDate(dateLike);
  const matchingEvents = getFilteredEvents()
    .filter((event) => eventSpansDate(event, selectedDate))
    .sort((left, right) => left.start.localeCompare(right.start));

  dayHeadingEl.textContent = formatLongDate(selectedDate);
  daySubtitleEl.textContent = APP_CONFIG.selectedDayLead(matchingEvents.length);

  if (!matchingEvents.length) {
    dayEventsEl.innerHTML = `<p class="empty-state">${APP_CONFIG.emptySelectedDay}</p>`;
    return;
  }

  dayEventsEl.innerHTML = "";
  matchingEvents.forEach((event) => {
    const department = departmentMap.get(event.department);
    const eventCard = document.createElement("article");
    eventCard.className = "day-event-card";
    eventCard.style.background = `linear-gradient(135deg, ${department?.color || "#355c7d"}, ${(department?.color || "#355c7d")}dd)`;
    eventCard.innerHTML = `
      <h3>${event.originalTitle || event.title}</h3>
      <p><strong>${event.department}</strong></p>
      ${event.subDepartment ? `<p>${event.subDepartment}</p>` : ""}
      ${event.location ? `<p><strong>Location:</strong> ${event.location}</p>` : ""}
      ${event.recurrenceWeekdays?.length ? `<p><strong>Repeats:</strong> ${formatWeekdayList(event.recurrenceWeekdays)}</p>` : ""}
      <p>${formatDateRange(event)}</p>
      <p>${event.description}</p>
      ${firebaseReady && event.id ? `<button class="secondary-action" data-delete-id="${event.id}">${APP_CONFIG.deleteLabel}</button>` : ""}
    `;
    dayEventsEl.appendChild(eventCard);
  });

  dayEventsEl.querySelectorAll("[data-delete-id]").forEach((button) => {
    button.addEventListener("click", async () => {
      await deleteEvent(button.dataset.deleteId);
    });
  });
}

function refreshCalendar() {
  calendar.removeAllEvents();
  calendar.addEventSource(getFilteredEvents());
  updateViewCopy();
  renderSelectedDay(activeDate);
}

async function handleEventSubmit(submitEvent) {
  submitEvent.preventDefault();

  const pinApproved = await requestSafetyPin();
  if (!pinApproved) {
    return;
  }

  if (!firebaseReady || !db) {
    setStatus("Firebase is not configured yet. Update static/firebase-config.js first.", "warning");
    return;
  }

  const department = departmentSelectEl.value;
  const subDepartment = subDepartmentSelectEl?.value.trim() || "";
  const title = eventTitleEl.value.trim();
  const location = eventLocationEl?.value.trim() || "";
  const start = eventStartEl.value;
  const end = eventEndEl.value;
  const description = eventDescriptionEl.value.trim();
  const forWhatEvent = eventForWhatEventEl?.value.trim() || "";
  const integrateOnOtherCalendar = Boolean(eventIntegrateCalendarEl?.checked);
  const travelerName = eventTravelerNameEl?.value.trim() || "";
  const travelLocation = eventTravelLocationEl?.value.trim() || "";
  const recurrenceWeekdays = APP_MODE === "calendar" ? getSelectedWeekdays() : [];

  if (!department || !title || !start || !end || !description || (APP_MODE === "travel" && !location)) {
    setStatus(APP_CONFIG.formMissing, "warning");
    return;
  }

  if (APP_MODE === "travel" && integrateOnOtherCalendar && !forWhatEvent) {
    setStatus('Please enter "For What Event" before integrating this travel declaration on the other calendar.', "warning");
    return;
  }

  if (APP_MODE === "calendar" && integrateOnOtherCalendar && (!travelerName || !travelLocation)) {
    setStatus('Please complete both "Who is traveling?" and "Travel Location" before integrating this event on the other calendar.', "warning");
    return;
  }

  if (parseLocalDate(end) < parseLocalDate(start)) {
    setStatus("End date cannot be earlier than start date.", "warning");
    return;
  }

  const spans = buildEventSpans(start, end, recurrenceWeekdays);
  if (!spans.length) {
    setStatus(`No ${APP_CONFIG.entityLabel}s matched the selected weekdays inside that date range.`, "warning");
    return;
  }

  const savedRecords = await saveEventRecords(
    spans.map((span) => ({
      department,
      subDepartment,
      title,
      location,
      start: span.start,
      end: span.end,
      description,
      recurrenceWeekdays
    }))
  );
  let mirrorSummary = "";

  if (APP_MODE === "travel" && integrateOnOtherCalendar) {
    const mirroredRecords = await saveEventRecords(
      spans.map((span) => ({
        department,
        subDepartment,
        title: forWhatEvent,
        location,
        start: span.start,
        end: span.end,
        description: buildCalendarDescriptionFromTravel(title, description),
        recurrenceWeekdays: []
      })),
      CALENDAR_EVENTS_PATH
    );
    mirrorSummary = formatMirrorSaveSummary(
      mirroredRecords,
      "event to the All Department Calendar",
      "events to the All Department Calendar"
    );
  }

  if (APP_MODE === "calendar" && integrateOnOtherCalendar) {
    const mirroredRecords = await saveEventRecords(
      spans.map((span) => ({
        department,
        subDepartment,
        title: travelerName,
        location: travelLocation,
        start: span.start,
        end: span.end,
        description: buildTravelDescriptionFromEvent(title, description),
        recurrenceWeekdays
      })),
      TRAVEL_DECLARATIONS_PATH
    );
    mirrorSummary = formatMirrorSaveSummary(
      mirroredRecords,
      "travel declaration to the Travel Calendar",
      "travel declarations to the Travel Calendar"
    );
  }

  selectedDepartments.add(department);
  if (subDepartment) {
    const selectedSet = selectedSubDepartments.get(department) || new Set();
    selectedSet.add(subDepartment);
    selectedSubDepartments.set(department, selectedSet);
  }

  allEvents = [
    ...allEvents.filter((event) => !savedRecords.some((savedRecord) => savedRecord.id === event.id)),
    ...savedRecords
  ];
  calendar.gotoDate(savedRecords[0].start);
  activeDate = parseLocalDate(savedRecords[0].start);
  refreshCalendar();

  eventFormEl.reset();
  departmentSelectEl.value = department;
  populateSubDepartmentOptions();
  syncCalendarIntegrationFields();
  if (savedRecords.length === 1 && !recurrenceWeekdays.length) {
    setStatus(`${APP_CONFIG.firebaseSave}${mirrorSummary}`, "success");
    return;
  }

  const weekdaySummary = recurrenceWeekdays.length
    ? ` for ${formatWeekdayList(recurrenceWeekdays)}`
    : "";
  setStatus(
    `Saved ${savedRecords.length} linked ${APP_CONFIG.entityLabel}${savedRecords.length === 1 ? "" : "s"}${weekdaySummary} to Firebase Realtime Database.${mirrorSummary}`,
    "success"
  );
}

function useSampleEvents() {
  const samples = APP_MODE === "travel" ? SAMPLE_TRAVEL_DECLARATIONS : SAMPLE_EVENTS;
  allEvents = samples.map((event, index) => ({
    ...event,
    id: `sample-${index + 1}`
  }));
  refreshCalendar();
}

function connectFirebase() {
  if (!isFirebaseConfigured()) {
    firebaseReady = false;
    setStatus("Firebase is not configured yet. Update static/firebase-config.js with your project values.", "warning");
    useSampleEvents();
    return;
  }

  const app = getApps().length ? getApp() : initializeApp(window.YFNED_FIREBASE_CONFIG);
  db = getDatabase(app);
  firebaseReady = true;
  setStatus(APP_CONFIG.firebaseLoading, "success");

  onValue(ref(db, APP_CONFIG.dbPath), (snapshot) => {
    const data = snapshot.val();
    if (!data) {
      allEvents = [];
      refreshCalendar();
      setStatus(APP_CONFIG.firebaseEmpty, "info");
      return;
    }

      allEvents = Object.entries(data).map(([id, event]) => ({
        id,
        title: event.title,
        department: event.department,
        subDepartment: event.subDepartment || "",
        location: event.location || "",
        start: event.start,
        end: event.end,
        description: event.description || "",
        seriesId: event.seriesId || "",
        occurrenceIndex: event.occurrenceIndex ?? null,
        occurrenceCount: event.occurrenceCount ?? null,
        recurrenceWeekdays: Array.isArray(event.recurrenceWeekdays) ? event.recurrenceWeekdays : []
    }));

    refreshCalendar();
    setStatus(APP_CONFIG.firebaseLoaded(allEvents.length), "success");
  });
}

function startCalendarApp() {
  if (appStarted) {
    return;
  }
  appStarted = true;

  createToggleMarkup();
  populateDepartmentOptions();
  populateSubDepartmentOptions();

  togglesHost.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-action-role]");
    if (!button) return;

    const actionRole = button.dataset.actionRole;

    if (actionRole === "all") {
      if (selectedDepartments.size === DEPARTMENTS.length) {
        selectedDepartments = new Set();
      } else {
        selectedDepartments = new Set(DEPARTMENTS.map((department) => department.name));
        Object.entries(SUB_DEPARTMENTS).forEach(([department, subDepartments]) => {
          selectedSubDepartments.set(department, new Set(subDepartments));
        });
      }
      activeNavDepartment = null;
      refreshCalendar();
      return;
    }

    if (actionRole === "department") {
      const departmentName = button.dataset.department;
      if (!departmentName) return;
      const hasSubDepartments = (SUB_DEPARTMENTS[departmentName] || []).length > 0;
      const allDepartmentsActive = selectedDepartments.size === DEPARTMENTS.length;

      if (departmentName === "Corporate Services") {
        if (allDepartmentsActive) {
          selectedDepartments = new Set([departmentName]);
          selectedSubDepartments.set(departmentName, new Set(SUB_DEPARTMENTS[departmentName] || []));
          activeNavDepartment = departmentName;
          refreshCalendar();
          return;
        }
        if (activeNavDepartment === departmentName) {
          selectedDepartments.delete(departmentName);
          activeNavDepartment = null;
          selectedSubDepartments.set(departmentName, new Set(SUB_DEPARTMENTS[departmentName] || []));
          refreshCalendar();
          return;
        }
        selectedDepartments.add(departmentName);
        selectedSubDepartments.set(departmentName, new Set(SUB_DEPARTMENTS[departmentName] || []));
        activeNavDepartment = departmentName;
        refreshCalendar();
        return;
      }

      if (allDepartmentsActive) {
        selectedDepartments = new Set([departmentName]);
        if (hasSubDepartments) {
          selectedSubDepartments.set(departmentName, new Set(SUB_DEPARTMENTS[departmentName]));
          activeNavDepartment = departmentName;
        } else {
          activeNavDepartment = null;
        }
        refreshCalendar();
        return;
      }

      if (hasSubDepartments && selectedDepartments.has(departmentName) && activeNavDepartment !== departmentName) {
        activeNavDepartment = departmentName;
        refreshCalendar();
        return;
      }

      if (selectedDepartments.has(departmentName)) {
        selectedDepartments.delete(departmentName);
        if (activeNavDepartment === departmentName) {
          activeNavDepartment = null;
        }
      } else {
        selectedDepartments.add(departmentName);
        if (hasSubDepartments) {
          selectedSubDepartments.set(departmentName, new Set(SUB_DEPARTMENTS[departmentName]));
          activeNavDepartment = departmentName;
        }
      }

      if (hasSubDepartments && selectedDepartments.has(departmentName)) {
        activeNavDepartment = departmentName;
      }

      refreshCalendar();
      return;
    }

    if (actionRole === "subdepartment") {
      const departmentName = button.dataset.department;
      const subDepartment = button.dataset.subdepartment;
      if (!departmentName || !subDepartment) return;

      if (selectedDepartments.size === DEPARTMENTS.length) {
        selectedDepartments = new Set([departmentName]);
      }

      if (departmentName === "Corporate Services" && activeNavDepartment !== departmentName) {
        selectedDepartments.add(departmentName);
        selectedSubDepartments.set(departmentName, new Set([subDepartment]));
        activeNavDepartment = departmentName;
        refreshCalendar();
        return;
      }

      const selectedSet = selectedSubDepartments.get(departmentName) || new Set();
      if (selectedSet.has(subDepartment)) {
        selectedSet.delete(subDepartment);
      } else {
        selectedSet.add(subDepartment);
      }
      selectedSubDepartments.set(departmentName, selectedSet);
      activeNavDepartment = departmentName;
      refreshCalendar();
    }
  });

  departmentSelectEl.addEventListener("change", () => {
    populateSubDepartmentOptions();
  });

  eventIntegrateCalendarEl?.addEventListener("change", () => {
    syncCalendarIntegrationFields(true);
  });
  syncCalendarIntegrationFields();

  eventFormEl.addEventListener("submit", (event) => {
    handleEventSubmit(event).catch(() => {
      setStatus("Could not save the event to Firebase. Check your configuration and database rules.", "error");
    });
  });

  if (APP_MODE !== "calendar" && eventSeriesFieldsetEl) {
    eventSeriesFieldsetEl.hidden = true;
  }

  const todayValue = formatDateInputValue(new Date());

  calendar = new FullCalendar.Calendar(document.getElementById("calendar"), {
    initialView: "dayGridMonth",
    initialDate: todayValue,
    height: "auto",
    fixedWeekCount: false,
    headerToolbar: {
      left: "prev,next today",
      center: "title",
      right: ""
    },
    events: [],
    displayEventTime: false,
    eventDisplay: "block",
    dateClick(info) {
      activeDate = info.date;
      if (selectedDayCell) {
        selectedDayCell.classList.remove("fc-day-selected");
      }
      info.dayEl.classList.add("fc-day-selected");
      selectedDayCell = info.dayEl;
      renderSelectedDay(info.date);
    }
  });

  calendar.render();
  updateViewCopy();

  activeDate = parseLocalDate(todayValue);
  renderSelectedDay(activeDate);
  connectFirebase();
}

if (document.body.dataset.authPage === "protected") {
  if (window.YFNED_AUTH_USER) {
    startCalendarApp();
  } else {
    window.addEventListener("yfned:auth-ready", startCalendarApp, { once: true });
  }
} else {
  startCalendarApp();
}
