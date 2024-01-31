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
  const slider = document.querySelector(".offer__slider");

  // V2 CARUSEL

  const slidesField = document.createElement("div");
  const width = window.getComputedStyle(container).width;
  slidesField.classList.add("offer__slider-inner");
  container.appendChild(slidesField);

  function initSlider() {
    images = document.querySelectorAll(".offer__slide");
  }

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
        // if (index !== 0) {
        //   slide.classList.add("hide");
        // } else {
        //   slide.classList.add("show");
        // }
        const img = document.createElement("img");
        img.src = imagesPath + fileName;
        img.alt = fileName.replace(".jpg", "");
        slide.appendChild(img);
        slidesField.appendChild(slide);
      });

      initSlider();
      let sliderIndex = 1;
      let offset = 0;

      slidesField.style.width = 100 * links.length + "%";
      slidesField.style.display = "flex";
      slidesField.style.transition = "0.5s all";
      container.style.overflow = "hidden";

      links.forEach((link) => {
        link.style.width = width;
      });

      // indicators-points

      slider.style.position = "relative";
      const indicators = document.createElement("ol");
      indicators.classList.add("carousel-indicators");
      slider.append(indicators);
      const dots = [];

      for (let i = 0; i < links.length; i++) {
        const dot = document.createElement("li");
        dot.setAttribute("data-slide-to", i + 1);
        dot.classList.add("dot");
        indicators.append(dot);
        if (i == 0) {
          dot.style.opacity = 1;
        }
        dots.push(dot);
      }
      console.log(dots);

      // next-prev clicks

      function deleteDigits(str) {
        return +str.replace(/\D/g, "");
      }

      sliderNext.addEventListener("click", () => {
        if (offset == deleteDigits(width) * (links.length - 1)) {
          offset = 0;
        } else {
          offset += deleteDigits(width);
        }
        slidesField.style.transform = `translateX(-${offset}px)`;

        if (sliderIndex == links.length) {
          sliderIndex = 1;
        } else {
          sliderIndex++;
        }

        if (links.length < 10) {
          sliderTotal.textContent = `0${links.length}`;
          sliderCurrent.textContent = `0${sliderIndex}`;
        } else {
          sliderTotal.textContent = links.length;
          sliderCurrent.textContent = sliderIndex;
        }
        dots.forEach((dot) => (dot.style.opacity = "0.5"));
        dots[sliderIndex - 1].style.opacity = 1;
      });

      sliderPrev.addEventListener("click", () => {
        if (offset == 0) {
          offset = deleteDigits(width) * (links.length - 1);
        } else {
          offset -= deleteDigits(width);
        }
        slidesField.style.transform = `translateX(-${offset}px)`;

        if (sliderIndex == 1) {
          sliderIndex = links.length;
        } else {
          sliderIndex--;
        }

        if (links.length < 10) {
          sliderTotal.textContent = `0${links.length}`;
          sliderCurrent.textContent = `0${sliderIndex}`;
        } else {
          sliderTotal.textContent = links.length;
          sliderCurrent.textContent = sliderIndex;
        }
        dots.forEach((dot) => (dot.style.opacity = "0.5"));
        dots[sliderIndex - 1].style.opacity = 1;
      });

      // dots behavior

      dots.forEach((dot) => {
        dot.addEventListener("click", (e) => {
          const slideTo = e.target.getAttribute("data-slide-to");
          sliderIndex = slideTo;
          offset = deleteDigits(width) * (slideTo - 1);
          slidesField.style.transform = `translateX(-${offset}px)`;
          if (links.length < 10) {
            sliderCurrent.textContent = `0${sliderIndex}`;
          } else {
            sliderCurrent.textContent = sliderIndex;
          }
          dots.forEach((dot) => (dot.style.opacity = "0.5"));
          dots[sliderIndex - 1].style.opacity = 1;
        });
      });

      // let index;

      //next/prev clicks

      // sliderPrev.addEventListener("click", () => {
      //   index = currentIndex - 1;
      //   if (index < 0) {
      //     index = imagesCount - 1;
      //   }
      //   changeCurrentImage(index);
      // });
      // sliderNext.addEventListener("click", () => {
      //   index = currentIndex + 1;
      //   if (index >= imagesCount) {
      //     index = 0;
      //   }
      //   changeCurrentImage(index);
      // });
    });

  // V1 (OWN)

  // let images;
  // let currentIndex = 0;

  // // images count func

  // function initSlider() {
  //   images = document.querySelectorAll(".offer__slide");
  // }

  // // images show/hide func

  // function changeCurrentImage(index) {
  //   images = document.querySelectorAll(".offer__slide");
  //   images[currentIndex].classList.add("hide");
  //   images[currentIndex].classList.remove("show");
  //   images[index].classList.add("show");
  //   images[index].classList.remove("hide");

  //   const imageElement = document.querySelector(".offer__slide.show img");
  //   const altValue = imageElement.getAttribute("alt");
  //   const imagePath = `../img/slider/${altValue}.jpg`;
  //   imageElement.setAttribute("src", imagePath);

  //   currentIndex = index;

  //   if (currentIndex + 1 < 10) {
  //     sliderCurrent.textContent = `0${currentIndex + 1}`;
  //   } else {
  //     sliderCurrent.textContent = `${currentIndex + 1}`;
  //   }
  // }

  // // taking imgs + funcs

  // fetch(imagesPath)
  //   .then((response) => response.text())
  //   .then((data) => {
  //     const div = document.createElement("div");
  //     div.innerHTML = data;
  //     const links = div.querySelectorAll("a[href$='.jpg']");
  //     sliderCurrent.textContent = "01";
  //     if (links.length < 10) {
  //       sliderTotal.textContent = `0${links.length}`;
  //     } else {
  //       sliderTotal.textContent = links.length;
  //     }
  //     links.forEach((link, index) => {
  //       const fileName = link.getAttribute("href").replace(imagesPath, "");
  //       const slide = document.createElement("div");
  //       slide.classList.add("offer__slide");
  //       if (index !== 0) {
  //         slide.classList.add("hide");
  //       } else {
  //         slide.classList.add("show");
  //       }
  //       const img = document.createElement("img");
  //       img.src = imagesPath + fileName;
  //       img.alt = fileName.replace(".jpg", "");
  //       slide.appendChild(img);
  //       container.appendChild(slide);
  //     });

  //     initSlider();
  //     const imagesCount = images.length;
  //     let index;

  //     sliderPrev.addEventListener("click", () => {
  //       index = currentIndex - 1;
  //       if (index < 0) {
  //         index = imagesCount - 1;
  //       }
  //       changeCurrentImage(index);
  //     });
  //     sliderNext.addEventListener("click", () => {
  //       index = currentIndex + 1;
  //       if (index >= imagesCount) {
  //         index = 0;
  //       }
  //       changeCurrentImage(index);
  //     });
  //   });

  // CALCULATE

  const result = document.querySelector(".calculating__result span");
  let sex;
  let height;
  let weight;
  let age;
  let ratio;

  // default values v1

  // if (localStorage.getItem("sex")) {
  //   sex = localStorage.getItem("sex");
  // } else {
  //   sex = "female";
  //   localStorage.setItem("sex", "female");
  // }

  // if (localStorage.getItem("ratio")) {
  //   ratio = localStorage.getItem("retio");
  // } else {
  //   ratio = 1.375;
  //   localStorage.setItem("ratio", 1.375);
  // }

  // default values v2

  sex = localStorage.getItem("sex") ? localStorage.getItem("sex") : "female";
  localStorage.setItem("sex", "female");

  ratio = localStorage.getItem("ratio") ? localStorage.getItem("ratio") : 1.375;
  localStorage.setItem("ratio", 1.375);

  function initLocalSettings(selector, activeClass) {
    const elements = document.querySelectorAll(selector);

    elements.forEach((elem) => {
      elem.classList.remove(activeClass);
      if (elem.getAttribute("id") === localStorage.getItem("sex")) {
        elem.classList.add(activeClass);
      }
      if (elem.getAttribute("data-ratio") === localStorage.getItem("ratio")) {
        elem.classList.add(activeClass);
      }
    });
  }

  initLocalSettings("#gender div", "calculating__choose-item_active");
  initLocalSettings(
    ".calculating__choose_big div",
    "calculating__choose-item_active"
  );

  // calc func

  function calcTotal() {
    if (!sex || !height || !weight || !age || !ratio) {
      result.textContent = "no data";
      return;
    }

    if (sex === "female") {
      result.textContent = Math.round(
        (447.6 + 9.2 * weight + 3.1 * height - 4.3 * age) * ratio
      );
    } else {
      result.textContent = Math.round(
        (88.36 + 13.4 * weight + 4.8 * height - 5.7 * age) * ratio
      );
    }
  }

  calcTotal();

  // get static data func

  function getStaticInformation(selector, activeClass) {
    const elements = document.querySelectorAll(selector);
    elements.forEach((elem) => {
      elem.addEventListener("click", (e) => {
        if (e.target.getAttribute("data-ratio")) {
          ratio = +e.target.getAttribute("data-ratio");
          localStorage.setItem("ratio", +e.target.getAttribute("data-ratio"));
        } else {
          sex = e.target.getAttribute("id");
          localStorage.setItem("sex", e.target.getAttribute("id"));
        }

        elements.forEach((elem) => {
          elem.classList.remove(activeClass);
        });

        e.target.classList.add(activeClass);

        calcTotal();
      });
    });
  }

  getStaticInformation("#gender div", "calculating__choose-item_active");
  getStaticInformation(
    ".calculating__choose_big div",
    "calculating__choose-item_active"
  );

  // get input param func

  function getDynamicInformation(selector) {
    const input = document.querySelector(selector);

    input.addEventListener("input", () => {
      // non-digit
      if (input.value.match(/\D/g)) {
        input.style.border = "2px solid red";
      } else {
        input.style.border = "none";
      }

      // inputs case
      switch (input.getAttribute("id")) {
        case "height":
          height = +input.value;
          break;
        case "weight":
          weight = +input.value;
          break;
        case "age":
          age = +input.value;
          break;
      }
      console.log(height, weight, age, sex, ratio);
      calcTotal();
    });
  }

  getDynamicInformation("#height");
  getDynamicInformation("#weight");
  getDynamicInformation("#age");
});
