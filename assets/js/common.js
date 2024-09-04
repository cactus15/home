document.addEventListener("DOMContentLoaded", function (event) {
  setHeight();

  if (document.querySelector("div.aside div.list")) setScroll(); // 서브 메뉴 있을때만 실행

  initTabs();

  initSwiper();

  setDblTouch();
});

window.addEventListener("resize", function (event) {
  setHeight();
});

/**
 * 모바일 높이 조정
 */
function setHeight() {
  document.documentElement.style.height = `${window.innerHeight}px`;
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

    if (typeof selector === "string") { // 셀렉터 문자열일 경우
      modal = document.querySelector(selector);
    } else if (selector instanceof HTMLElement) { // 팝업 엘리먼트일 경우
      modal = selector;
    }

    if (modal.classList.contains("modal") === false) { // 팝업 엘리먼트가 아니면 부모중 팝업 엘리먼트 찾기
      modal = modal.closest(".modal");
    }

    return modal;
  },
  show: function (selector) {
    this.get(selector).classList.add("is-open"); // is-open 클래스 추가
  },
  close: function (selector) { 
    const modal = this.get(selector);
    modal.classList.add('is-close'); // is-close 클래스 추가

    modal.querySelector(".container").addEventListener('animationend', function() {
      modal.classList.remove('is-open', 'is-close'); // is-open, is-close 클래스 제거
    }, { once: true });
  }
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
    const contents = tabsContainer.nextElementSibling.querySelectorAll(".tab-content > div");

    tabs.forEach((tab, index) => {
      tab.addEventListener("click", () => {
        tabs.forEach((t) => t.classList.remove("active"));
        contents.forEach((c) => c.classList.remove("active"));

        tab.classList.add("active");
        contents[index].classList.add("active");
      });
    });

    // 기본적으로 첫 번째 탭을 활성화합니다.
    tabs[0].classList.add("active");
    contents[0].classList.add("active");
  }
}

/**
 * swiper 초기화
 */
function initSwiper() {
  const swiperList = document.querySelectorAll(".swiper-list dd > div");

  swiperList.forEach((swiper) => {
    let startX;
  
    swiper.addEventListener('touchstart', function(e) {
      startX = e.touches[0].clientX;
    });
  
    swiper.addEventListener('touchmove', function(e) {
      const touchX = e.touches[0].clientX;
      const difference = touchX - startX;
  
      if (difference < -50) { // 왼쪽으로 스와이프
        // 모든 swipe-box에서 swiped 클래스를 제거
        swiperList.forEach(box => {
          if (box !== swiper) {
              box.classList.remove('swiped');
          }
        });
        swiper.classList.add('swiped');
      } else if (difference > 50) { // 오른쪽으로 스와이프
        swiper.classList.remove('swiped');
      }
    });
  
    // 마우스 이벤트 추가 (데스크탑 지원)
    let isDragging = false;
  
    swiper.addEventListener('mousedown', function(e) {
      startX = e.clientX;
      isDragging = true;
    });
  
    swiper.addEventListener('mousemove', function(e) {
      if (!isDragging) return;
  
      const difference = e.clientX - startX;
  
      if (difference < -50) { // 왼쪽으로 드래그
        // 모든 swipe-box에서 swiped 클래스를 제거
        swiperList.forEach(box => {
          if (box !== swiper) {
              box.classList.remove('swiped');
          }
        });
        swiper.classList.add('swiped');
      } else if (difference > 50) { // 오른쪽으로 드래그
        swiper.classList.remove('swiped');
      }
    });
  
    swiper.addEventListener('mouseup', function() {
      isDragging = false;
    });
  
    swiper.addEventListener('mouseleave', function() {
      isDragging = false;
    });
  });
}

/**
 * 더블터치 방지
 */
function setDblTouch() {
  let lastTouchEnd = 0;

  document.addEventListener('touchend', function(event) {
      const now = (new Date()).getTime();
      if (now - lastTouchEnd <= 300) {
          event.preventDefault();
      }
      lastTouchEnd = now;
  }, { passive: false });
}
