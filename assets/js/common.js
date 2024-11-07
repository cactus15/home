document.addEventListener("DOMContentLoaded", function (event) {
  initHeight();

  if (document.querySelector("div.aside div.list")) setScroll(); // 서브 메뉴 있을때만 실행

  initTabs();

  initSwiper();

  setDblTouch();

  // 모바일 높이 조정   
  if (window.visualViewport) {
    // 키보드가 올라왔을 때 동작하는 visualViewport resize 이벤트 설정
    window.visualViewport.addEventListener('resize', () => {
      if (window.visualViewport.height < window.innerHeight) {
        // 키패드가 올라온 상태일 때 스크롤 차단
        disableScroll();
      } else {
        // 키패드가 내려간 상태일 때 스크롤 복구
        enableScroll();
      }
    });
  }
});

// 스크롤 및 터치 움직임 차단
function preventScroll(event) {
    event.preventDefault();
}

// 키패드가 올라올 때 스크롤 차단 및 화면 고정
function disableScroll() {

  // 터치 움직임 차단
  document.addEventListener('touchmove', preventScroll, { passive: false });
}

// 키패드가 내려갈 때 스크롤 복구
function enableScroll() {
  // 터치 이벤트 차단 해제
  document.removeEventListener('touchmove', preventScroll);
}

function initHeight() {
  window.addEventListener("resize", setHeight);
  setHeight(); // 페이지가 로드될 때 실행
}

/**
 * 모바일 높이 조정
 */
function setHeight() {
  const height = window.visualViewport ? window.visualViewport.height : window.innerHeight;
  document.documentElement.style.height = `${height}px`;
}

/**
 * 모바일 스크롤바 생성
 */
function setScroll() {
  // 스크롤바
  // https://www.npmjs.com/package/overlayscrollbars-react
  var { OverlayScrollbars, ScrollbarsHidingPlugin, SizeObserverPlugin, ClickScrollPlugin } = OverlayScrollbarsGlobal;

  OverlayScrollbars(document.querySelector("div.aside div.list"), {
    overflow: {
      x: "hidden",
    },
  });
}

/**
 * toast popup 랩핑
 */
function toastify(msg) {
  // 토스트 팝업
  // https://github.com/apvarun/toastify-js/blob/master/README.md
  Toastify({
    text: msg,
    duration: 3000, // 토스트 팝업 시간
    selector: "main-content",
    className: "toast-popup",
    gravity: "bottom",
    position: "left",
    offset: {
      x: 5,
      y: 5,
    },
  }).showToast();
}

/**
 * modal
 */
const modal = {
  // 대상 팝업 찾기
  get: function (selector) {
    let modal = null;

    if (typeof selector === "string") {
      // 셀렉터 문자열일 경우
      modal = document.querySelector(selector);
    } else if (selector instanceof HTMLElement) {
      // 팝업 엘리먼트일 경우
      modal = selector;
    }

    if (modal.classList.contains("modal") === false) {
      // 팝업 엘리먼트가 아니면 부모중 팝업 엘리먼트 찾기
      modal = modal.closest(".modal");
    }

    return modal;
  },
  show: function (selector, tabNum) {
    const modal = this.get(selector);

    if (tabNum) {
      // 탭 번호가 있으면 해당 탭 활성화
      if (typeof tabNum === "number" && !isNaN(tabNum)) {
        // 숫자인지 확인
        modal.querySelector(".tabs").querySelectorAll(".tab")[tabNum - 1].click(); // 탭 클릭
      }
    }

    modal.classList.add("is-open"); // is-open 클래스 추가
    modal.closest(".main").classList.add("no-scroll"); // 스크롤 가능하도록 클래스 제거
  },
  close: function (selector) {
    const modal = this.get(selector);
    modal.classList.add("is-close"); // is-close 클래스 추가

    modal.querySelector(".container").addEventListener(
      "animationend",
      function () {
        modal.classList.remove("is-open", "is-close"); // is-open, is-close 클래스 제거
        modal.closest(".main").classList.remove("no-scroll"); // 스크롤 가능하도록 클래스 제거
      },
      { once: true }
    );
  },
};

/**
 * tab 초기화
 */
function initTabs() {
  // 탭
  const tabsContainers = document.querySelectorAll(".tabs");
  tabsContainers.forEach((tabsContainer) => initTab(tabsContainer));

  function initTab(tabsContainer) {
    const tabs = tabsContainer.querySelectorAll(".tab");
    const contents = tabsContainer.nextElementSibling.querySelectorAll(":scope > div");

    tabs.forEach((tab, index) => {
      tab.addEventListener("click", () => {
        tabs.forEach((t) => t.classList.remove("active"));
        contents.forEach((c) => c.classList.remove("active"));

        tab.classList.add("active");
        contents[index].classList.add("active");
      });
    });
  }
}

/**
 * swiper 초기화
 */
function initSwiper() {
  const swiperList = document.querySelectorAll(".swiper-list dd > div");

  swiperList.forEach((swiper) => {
    let startX;
    let startY;
    let isHorizontalSwipe = false; // 수평 스와이프 감지 플래그

    swiper.addEventListener("touchstart", function (e) {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      isHorizontalSwipe = false; // 초기화
    });

    swiper.addEventListener("touchmove", function (e) {
      const touchX = e.touches[0].clientX;
      const touchY = e.touches[0].clientY;
      const differenceX = touchX - startX;
      const differenceY = touchY - startY;

      // 첫 움직임에서 수평 스와이프 여부를 감지
      if (!isHorizontalSwipe) {
        if (Math.abs(differenceX) > Math.abs(differenceY)) {
          isHorizontalSwipe = true;
        } else {
          return; // 수직으로 스크롤이 발생한 경우 더 이상 처리하지 않음
        }
      }

      // 수평 스와이프가 감지되면 스크롤 방지
      e.preventDefault();

      if (differenceX < -50) {
        // 왼쪽으로 스와이프
        // 모든 swipe-box에서 swiped 클래스를 제거
        swiperList.forEach((box) => {
          if (box !== swiper) {
            box.classList.remove("swiped");
          }
        });
        swiper.classList.add("swiped");
      } else if (differenceX > 50) {
        // 오른쪽으로 스와이프
        swiper.classList.remove("swiped");
      }
    });

    // 마우스 이벤트 추가 (데스크탑 지원)
    let isDragging = false;

    swiper.addEventListener("mousedown", function (e) {
      startX = e.clientX;
      isDragging = true;
    });

    swiper.addEventListener("mousemove", function (e) {
      if (!isDragging) return;

      const difference = e.clientX - startX;

      if (difference < -50) {
        // 왼쪽으로 드래그
        // 모든 swipe-box에서 swiped 클래스를 제거
        swiperList.forEach((box) => {
          if (box !== swiper) {
            box.classList.remove("swiped");
          }
        });
        swiper.classList.add("swiped");
      } else if (difference > 50) {
        // 오른쪽으로 드래그
        swiper.classList.remove("swiped");
      }
    });

    swiper.addEventListener("mouseup", function () {
      isDragging = false;
    });

    swiper.addEventListener("mouseleave", function () {
      isDragging = false;
    });
  });
}

/**
 * 더블터치 방지
 */
function setDblTouch() {
  let lastTouchEnd = 0;

  document.addEventListener(
    "touchend",
    function (event) {
      const now = new Date().getTime();
      if (now - lastTouchEnd <= 300) {
        event.preventDefault();
      }
      lastTouchEnd = now;
    },
    { passive: false }
  );
}
