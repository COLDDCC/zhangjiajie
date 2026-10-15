/* Editorial layer — no dependencies, no layout shift, ~1KB gzipped.
   Everything here is progressive: with JS off the page is fully readable. */
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* 1. Scroll reveal ------------------------------------------------- */
  var targets = document.querySelectorAll(".rv");
  if (!("IntersectionObserver" in window) || reduce) {
    for (var i = 0; i < targets.length; i++) targets[i].classList.add("in");
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -12% 0px", threshold: 0.06 });
    targets.forEach(function (t) { io.observe(t); });
  }

  /* 2. Hero parallax — transform only, never triggers layout --------- */
  var bg = document.querySelector(".hero.photo .shot-bg");
  if (bg && !reduce) {
    var ticking = false;
    window.addEventListener("scroll", function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var y = window.scrollY;
        if (y < window.innerHeight * 1.2) {
          bg.style.transform = "scale(1.06) translate3d(0," + (y * 0.16) + "px,0)";
        }
        ticking = false;
      });
    }, { passive: true });
  }

  /* 3. Sticky section rail highlight --------------------------------- */
  var links = document.querySelectorAll(".rail-nav a");
  if (links.length && "IntersectionObserver" in window) {
    var map = {};
    links.forEach(function (a) {
      var el = document.querySelector(a.getAttribute("href"));
      if (el) map[el.id] = a;
    });
    var so = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          links.forEach(function (a) { a.classList.remove("on"); });
          if (map[e.target.id]) map[e.target.id].classList.add("on");
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    Object.keys(map).forEach(function (id) { so.observe(document.getElementById(id)); });
  }
})();
