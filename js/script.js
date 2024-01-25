window.addEventListener("DOMContentLoaded", () => {
  // TABS

  const tabs = document.querySelectorAll(".tabheader__item");
  const tabsContent = document.querySelectorAll(".tabcontent");
  const tabsParent = document.querySelector(".tabheader__items");

  //   hide content
  function hideTabContent() {
    tabsContent.forEach((item) => {
      item.classList.add("hide");
      item.classList.remove("show", "fade");
    });
    tabs.forEach((item) => {
      item.classList.remove("tabheader__item_active");
    });
  }

  //   show content
  function showTabContent(i = 0) {
    tabsContent[i].classList.add("show", "fade");
    tabsContent[i].classList.remove("hide");
    tabs[i].classList.add("tabheader__item_active");
  }

  hideTabContent();
  showTabContent();

  //   switcher
  tabsParent.addEventListener("click", (event) => {
    const target = event.target;
    if (target && target.classList.contains("tabheader__item")) {
      tabs.forEach((item, i) => {
        if (target == item) {
          hideTabContent();
          showTabContent(i);
        }
      });
    }
  });

  //TIMER

  const deadline = "2024-02-11";

  // difference current dedline

  function getTimeRemaining(endtime) {
    let days, hours, minutes, seconds;
    const t = Date.parse(endtime) - Date.parse(new Date());

    if (t <= 0) {
      days = 0;
      hours = 0;
      minutes = 0;
      seconds = 0;
    } else {
      days = Math.floor(t / (1000 * 60 * 60 * 24));
      seconds = Math.floor((t / 1000) % 60);
      minutes = Math.floor((t / 1000 / 60) % 60);
      hours = Math.floor((t / (1000 * 60 * 60)) % 24);
    }

    return {
      total: t,
      days: days,
      hours: hours,
      minutes: minutes,
      seconds: seconds,
    };
  }

  // show null+

  function getZero(num) {
    if (num >= 0 && num < 10) {
      return "0" + num;
    } else {
      return num;
    }
  }

  // setting clock

  function setClock(selector, endtime) {
    const timer = document.querySelector(selector);
    const days = timer.querySelector("#days");
    const hours = timer.querySelector("#hours");
    const minutes = timer.querySelector("#minutes");
    const seconds = timer.querySelector("#seconds");
    const timeInterval = setInterval(updateClock, 1000);

    function updateClock() {
      const t = getTimeRemaining(endtime);
      days.innerHTML = getZero(t.days);
      hours.innerHTML = getZero(t.hours);
      minutes.innerHTML = getZero(t.minutes);
      seconds.innerHTML = getZero(t.seconds);

      if (t.total <= 0) {
        clearInterval(timeInterval);
      }
    }
  }
  setClock(".timer", deadline);

  // MODAL

  const modalTriggers = document.querySelectorAll("[data-modal]");
  const modal = document.querySelector(".modal");
  const modalCloseBtn = document.querySelector("[data-close]");

  function openModal() {
    modal.classList.add("show");
    modal.classList.remove("hide");
    document.body.style.overflow = "hidden";
    clearInterval(modalTimerId);
  }

  function closeModal() {
    modal.classList.add("hide");
    modal.classList.remove("show");
    document.body.style.overflow = "";
  }

  modalTriggers.forEach((btn) => {
    btn.addEventListener("click", openModal);
  });

  // modalCloseBtn.addEventListener("click", closeModal);

  modal.addEventListener("click", (e) => {
    if (e.target === modal || e.target.getAttribute("data-close") == "") {
      closeModal();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.code === "Escape" && modal.classList.contains("show")) {
      closeModal();
    }
  });

  const modalTimerId = setTimeout(openModal, 5000);

  function showModalByScroll() {
    if (
      window.pageYOffset + document.documentElement.clientHeight >=
      document.documentElement.scrollHeight - 1
    ) {
      openModal();
      window.removeEventListener("scroll", showModalByScroll);
    }
  }

  window.addEventListener("scroll", showModalByScroll);

  //  CARDS

  class MenuCard {
    constructor(src, alt, title, descr, price, parentSelector) {
      this.src = src;
      this.alt = alt;
      this.title = title;
      this.descr = descr;
      this.price = price;
      this.parent = document.querySelector(parentSelector);
      this.transfer = 38;
      this.changeToUAH();
    }

    changeToUAH() {
      this.price = this.price * this.transfer;
    }

    render() {
      const element = document.createElement("div");
      element.innerHTML = `
      <div class="menu__item">
        <img src=${this.src} alt=${this.alt} />
        <h3 class="menu__item-subtitle">${this.title}</h3>
        <div class="menu__item-descr">
          ${this.descr}
        </div>
        <div class="menu__item-divider"></div>
        <div class="menu__item-price">
          <div class="menu__item-cost">Цена:</div>
          <div class="menu__item-total"><span>${this.price}</span> грн/день</div>
        </div>
      </div>`;
      this.parent.append(element);
    }
  }

  //FORMS

  // get function

  // const getRecourse = async (url) => {
  //   const res = await fetch(url);

  //   if (!res.ok) {
  //     throw new Error(`Could not fetch ${url}, status ${res.status}`);
  //   }
  //   return await res.json();
  // };

  axios.get("http://localhost:3000/menu").then((data) => {
    data.data.forEach(({ img, altimg, title, descr, price }) => {
      new MenuCard(
        img,
        altimg,
        title,
        descr,
        price,
        ".menu .container"
      ).render();
    });
  });

  const forms = document.querySelectorAll("form");

  const message = {
    loading: "icons/spinner.svg",
    success: "Спасибо! Мы с вами свяжемся",
    failure: "Что-то пошло не так...",
  };

  forms.forEach((item) => {
    bindPostData(item);
  });

  // post function

  const postData = async (url, data) => {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: data,
    });
    return await res.json();
  };

  function bindPostData(form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const statusMessage = document.createElement("img");
      statusMessage.src = message.loading;
      statusMessage.style.cssText = `
      display: block;
      margin: 0 auto;
      `;

      form.insertAdjacentElement("afterend", statusMessage);

      const formData = new FormData(form);

      const json = JSON.stringify(Object.fromEntries(formData.entries()));

      postData("http://localhost:3000/requests", json)
        .then((data) => {
          console.log(data);
          showThanksModal(message.success);
          statusMessage.remove();
        })
        .catch(() => {
          showThanksModal(message.failure);
        })
        .finally(() => {
          form.reset();
        });
    });
  }

  // THANKS MODAL

  function showThanksModal(message) {
    const prevModalDialog = document.querySelector(".modal__dialog");
    prevModalDialog.classList.add("hide");
    openModal();
    const thanksModal = document.createElement("div");
    thanksModal.classList.add("modal__dialog");
    thanksModal.innerHTML = `
    <div class="modal__content">
      <div class="modal__close" data-close>&times;</div>
      <div class="modal__title">${message}</div>
    </div>`;
    document.querySelector(".modal").append(thanksModal);
    setTimeout(() => {
      thanksModal.remove();
      prevModalDialog.classList.add("show");
      prevModalDialog.classList.remove("hide");
      closeModal();
    }, 3000);
  }

  // SLIDER

  const sliderTotal = document.querySelector("#total");
  const sliderCurrent = document.querySelector("#current");
  const container = document.querySelector(".offer__slider-wrapper");
  const imagesPath = "../img/slider/";

  const sliderPrev = document.querySelector(".offer__slider-prev");
  const sliderNext = document.querySelector(".offer__slider-next");
  let images;
  let currentIndex = 0;

  // images count func

  function initSlider() {
    images = document.querySelectorAll(".offer__slide");
  }

  // images show/hide func

  function changeCurrentImage(index) {
    images = document.querySelectorAll(".offer__slide");
    console.log(images[currentIndex], images[index]);
    images[currentIndex].classList.add("hide");
    images[currentIndex].classList.remove("show");
    images[index].classList.add("show");
    images[index].classList.remove("hide");

    const imageElement = document.querySelector(".offer__slide.show img");
    console.log(imageElement);
    // let slideDiscrb = parseInt($(this).find("img").attr("alt"));

    // var imgElement = document.querySelector('img');
    var altValue = imageElement.getAttribute("alt");

    const imagePath = `../img/slider/${altValue}.jpg`;
    imageElement.setAttribute("src", imagePath);

    currentIndex = index;

    if (currentIndex + 1 < 10) {
      sliderCurrent.textContent = `0${currentIndex + 1}`;
    } else {
      sliderCurrent.textContent = `${currentIndex + 1}`;
    }
  }

  // taking imgs + funcs

  fetch(imagesPath)
    .then((response) => response.text())
    .then((data) => {
      const div = document.createElement("div");
      div.innerHTML = data;
      const links = div.querySelectorAll("a[href$='.jpg']");
      sliderCurrent.textContent = "01";
      if (links.length < 10) {
        sliderTotal.textContent = `0${links.length}`;
      } else {
        sliderTotal.textContent = links.length;
      }
      links.forEach((link, index) => {
        const fileName = link.getAttribute("href").replace(imagesPath, "");
        const slide = document.createElement("div");
        slide.classList.add("offer__slide");
        if (index !== 0) {
          slide.classList.add("hide");
        } else {
          slide.classList.add("show");
        }
        const img = document.createElement("img");
        img.src = imagesPath + fileName;
        img.alt = fileName.replace(".jpg", "");
        slide.appendChild(img);
        container.appendChild(slide);
      });

      initSlider();
      const imagesCount = images.length;
      let index;

      sliderPrev.addEventListener("click", () => {
        index = currentIndex - 1;
        if (index < 0) {
          index = imagesCount - 1;
        }
        changeCurrentImage(index);
      });
      sliderNext.addEventListener("click", () => {
        index = currentIndex + 1;
        if (index >= imagesCount) {
          index = 0;
        }
        changeCurrentImage(index);
      });
    });
});
