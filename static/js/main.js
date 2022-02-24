window.onload = init;

const pms = {
  port_gen: {
    running: false,
    online: false,
    auto: false,
    volts: 0,
    amps: 0,
    frec: 0
  },
  stbd_gen: {
    running: false,
    online: false,
    auto: false,
    volts: 0,
    amps: 0,
    frec: 0
  },
  shore_gen: {
    running: false,
    online: false,
    auto: false,
    volts: 0,
    amps: 0,
    frec: 0
  }
}

function initGauges() {
  alert('loading gauges')
  var opts = {
    percentColors: [[0.0, "#a9d70b" ], [0.50, "#f9c802"], [1.0, "#ff0000"]],
    angle: 0, // The span of the gauge arc
    lineWidth: 0.44, // The line thickness
    radiusScale: 1, // Relative radius
    pointer: {
      length: 0.6, // // Relative to gauge radius
      strokeWidth: 0.044, // The thickness
      color: '#FFF' // Fill color
    },
    limitMax: false,     // If false, max value increases automatically if value > maxValue
    limitMin: false,     // If true, the min value of the gauge will be fixed
    colorStart: '#6FADCF',   // Colors
    colorStop: '#2912F1',    // just experiment with them
    strokeColor: '#000',  // to see which ones work best for you
    generateGradient: true,
    highDpiSupport: true,     // High resolution support
    
  };
  var target = document.getElementById('foo'); // your canvas element
  var gauge = new Gauge(target).setOptions(opts); // create sexy gauge!
  gauge.maxValue = 600; // set max gauge value
  gauge.setMinValue(0);  // Prefer setter over gauge.minValue = 0
  gauge.animationSpeed = 128; // set animation speed (32 is default value)
  gauge.set(400); // set actual value

  var target2 = document.getElementById('foo2'); // your canvas element
  var gauge2 = new Gauge(target2).setOptions(opts); // create sexy gauge!
  gauge2.maxValue = 600; // set max gauge value
  gauge2.setMinValue(0);  // Prefer setter over gauge.minValue = 0
  gauge2.animationSpeed = 128; // set animation speed (32 is default value)
  gauge2.set(400); // set actual value


  var target4 = document.getElementById('foo4'); // your canvas element
  var gauge4 = new Gauge(target4).setOptions(opts); // create sexy gauge!
  gauge4.maxValue = 600; // set max gauge value
  gauge4.setMinValue(0);  // Prefer setter over gauge.minValue = 0
  gauge4.animationSpeed = 128; // set animation speed (32 is default value)
  gauge4.set(400); // set actual value

  var target5 = document.getElementById('foo5'); // your canvas element
  var gauge5 = new Gauge(target5).setOptions(opts); // create sexy gauge!
  gauge5.maxValue = 600; // set max gauge value
  gauge5.setMinValue(0);  // Prefer setter over gauge.minValue = 0
  gauge5.animationSpeed = 128; // set animation speed (32 is default value)
  gauge5.set(400); // set actual value 
}

function updateUI() {

}

function initEvents() {
  const stbd_start = document.getElementById('stbd_start')
  stbd_start.addEventListener('click', function() {
    (async () => {
      const rawResponse = await fetch('add_cmd', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({'cmd': 'start_stbd'})
      });
      const content = await rawResponse.json();
      console.log(content)
    })();
  })

  const port_start = document.getElementById('port_start')
  port_start.addEventListener('click', function() {
    (async () => {
      const rawResponse = await fetch('add_cmd', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({'cmd': 'start_port'})
      });
      const content = await rawResponse.json();
      console.log(content)
    })();
  })

  /// Parallel section
  const port_auto = document.getElementById('port_auto')
  port_auto.addEventListener('click', function() {
    (async () => {
      const rawResponse = await fetch('add_cmd', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({'cmd': 'port_auto'})
      });
      const content = await rawResponse.json();
      console.log(content)
    })();
  })

  const stbd_auto = document.getElementById('stbd_auto')
  stbd_auto.addEventListener('click', function() {
    (async () => {
      const rawResponse = await fetch('add_cmd', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({'cmd': 'stbd_auto'})
      });
      const content = await rawResponse.json();
      console.log(content)
    })();
  })
}

function updatePMS(content) {
    pms.port_gen.volts = content['port_volts'];
    pms.port_gen.amps = content['port_gen_power'];
    pms.port_gen.frec = content['port_frec'];
    pms.port_gen.cos = content['port_cos'];


    updateUI()
}

function init() { 
  initEvents();
  initGauges();

    setInterval(function() {
      (async () => {
        const rawResponse = await fetch('get_status', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({'pms': 'get'})
        });
        const content = await rawResponse.json();
        
        updatePMS(content['pms'])
      })();

    }, 3000);
}