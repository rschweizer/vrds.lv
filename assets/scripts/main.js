(function(window) {
  function getOffset(marker, container) {
    var offsetX =
      marker.offsetLeft + marker.offsetWidth / 2 - container.offsetWidth / 2;
    var offsetY =
      marker.offsetTop + marker.offsetHeight - container.offsetHeight / 2;

    return [-offsetX, -offsetY];
  }

  function stroll(callback, origin, destination, next, timestamp, now) {
    var duration = Math.abs(destination - origin) / 4;
    var time = Math.min(1, (now - timestamp) / duration);
    var easing = time < 0.5 ? 2 * time * time : -1 + (4 - 2 * time) * time;

    window.scroll(0, Math.ceil(easing * (destination - origin) + origin));

    if (
      window.pageYOffset >= destination - 2 &&
      window.pageYOffset <= destination + 2
    ) {
      callback();
    } else {
      next(
        stroll.bind(undefined, callback, origin, destination, next, timestamp)
      );
    }
  }

  function scrollToSection(offset, id, e) {
    e.preventDefault();

    var section = document.getElementById(id);

    var max =
      document.documentElement.offsetHeight -
      document.documentElement.clientHeight;

    var origin = window.pageYOffset;
    var destination =
      section.offsetHeight > window.innerHeight * 1.1
        ? section.offsetTop - Math.round(window.innerHeight / 10)
        : section.offsetTop -
          Math.round((window.innerHeight - section.offsetHeight) / 2);

    var next =
      window.requestAnimationFrame ||
      window.mozRequestAnimationFrame ||
      window.webkitAnimationFrame ||
      function(fn) {
        setTimeout(fn, 15, Date.now());
      };

    next(
      stroll.bind(
        undefined,
        function() {
          window.history.pushState(undefined, "", "#" + id);
        },
        origin,
        Math.min(destination, max),
        next,
        window.performance ? window.performance.now() : Date.now()
      )
    );
  }

  window.addEventListener(
    "load",
    function() {
      var menu = document.getElementById("menu");

      var offset = window.innerWidth < 480 ? menu.offsetHeight : 0;

      for (var i = 0; i < menu.children.length; i++) {
        var item = menu.children[i];

        item.addEventListener(
          "click",
          scrollToSection.bind(
            undefined,
            offset,
            item.href.slice(item.href.lastIndexOf("#") + 1)
          )
        );
      }

      var link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://api.mapbox.com/mapbox-gl-js/v1.6.1/mapbox-gl.css";

      var script = document.createElement("script");
      script.defer = true;
      script.src = "https://api.mapbox.com/mapbox-gl-js/v1.6.1/mapbox-gl.js";

      setTimeout(function() {
        document.head.appendChild(link);
        document.head.appendChild(script);
      }, 1000);

      script.addEventListener(
        "load",
        function() {
          mapboxgl.accessToken =
            "pk.eyJ1IjoicnNjaHdlaXplciIsImEiOiJjazUwdmIxYWMwbzU2M2xzYWFueWw4bjg2In0.Rlq4VmoxMqQMqR6KwHxx2Q";

          var container = document.getElementById("map");
          var marker = document.getElementById("marker").parentNode.parentNode;

          var center = new mapboxgl.LngLat(12.0595, 49.04125);
          var map = new mapboxgl.Map({
            attributionControl: false,
            center: center,
            container: "map",
            interactive: false,
            logoPosition: "top-left",
            maxzoom: 10,
            minzoom: 10,
            style: "mapbox://styles/mapbox/outdoors-v11?optimize=true",
            trackResize: false,
            zoom: 10
          }).panBy(getOffset(marker, container), { animate: false });

          var timeout;
          window.addEventListener("resize", function() {
            container.classList.add("foggy");

            clearTimeout(timeout);

            timeout = setTimeout(function() {
              map
                .resize()
                .setCenter(center)
                .panBy(getOffset(marker, container), { animate: false });

              container.classList.remove("foggy");
            }, 500);
          });
        },
        { once: true }
      );
    },
    { once: true }
  );
})(window);
