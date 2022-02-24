window.onload = init;

const pms = {
  port_gen: {
    breaker: false,
    running: false,
    online: false,
    auto: false,
    volts: 0,
    amps: 0,
    frec: 0
  },
  stbd_gen: {
    breaker: false,
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
  },
  gauges: {}, 
  connected: false, 
  thruster_auto: false,
  thruster_on: false
}

function initGauges() {
    // Link data with UI
    pms.port_volts_text = document.getElementById('port-volts-text');
    pms.port_amps_text = document.getElementById('port-amps-text');
    pms.port_frec_text = document.getElementById('port-frec-text');
    pms.port_power_factor_text = document.getElementById('port-power-factor-text');

    pms.stbd_volts_text = document.getElementById('stbd-volts-text');
    pms.stbd_amps_text = document.getElementById('stbd-amps-text');
    pms.stbd_frec_text = document.getElementById('stbd-frec-text');
    pms.stbd_power_factor_text = document.getElementById('stbd-power-factor-text');  

  var opts = {
    percentColors: [[0.0, "#bc0000" ], [0.35, "#bc0000"], [0.70, "#00ff00"], [0.90, "#00ff00"], [0.95, "#ff0000"], [1.0, "#ff0000"]],
    angle: 0, // The span of the gauge arc
    lineWidth: 0.34, // The line thickness
    radiusScale: 1, // Relative radius
    pointer: {
      length: 0.6, // // Relative to gauge radius
      strokeWidth: 0.054, // The thickness
      color: '#aaa' // Fill color
    },
    limitMax: false,     // If false, max value increases automatically if value > maxValue
    limitMin: false,     // If true, the min value of the gauge will be fixed
    colorStart: '#6FADCF',   // Colors
    colorStop: '#2912F1',    // just experiment with them
    strokeColor: '#000',  // to see which ones work best for you
    generateGradient: true,
    highDpiSupport: true,     // High resolution support
    
  };
  const port_volts = document.getElementById('port-volts');
  const port_volts_gauge = new Gauge(port_volts).setOptions(opts);
  port_volts_gauge.maxValue = 500; 
  port_volts_gauge.setMinValue(0);
  port_volts_gauge.animationSpeed = 128; 
  //port_volts_gauge.set(0); 
  pms.gauges.port_volts_gauge = port_volts_gauge;

  const port_amps = document.getElementById('port-amps'); 
  const port_amps_gauge = new Gauge(port_amps).setOptions(opts);
  port_amps_gauge.maxValue = 200;
  port_amps_gauge.setMinValue(0);
  port_amps_gauge.animationSpeed = 128;
  //port_amps_gauge.set(400);
  pms.gauges.port_amps_gauge = port_amps_gauge;



  const port_frec = document.getElementById('port-frec');
  const port_frec_gauge = new Gauge(port_frec).setOptions(opts);
  port_frec_gauge.maxValue = 60;
  port_frec_gauge.setMinValue(0);
  port_frec_gauge.animationSpeed = 128;
  //port_frec_gauge.set(400);
  pms.gauges.port_frec_gauge = port_frec_gauge;

  const port_factor = document.getElementById('port-power-factor');
  const port_power_factor_gauge = new Gauge(port_factor).setOptions(opts);
  port_power_factor_gauge.maxValue = 1;
  port_power_factor_gauge.setMinValue(0);
  port_power_factor_gauge.animationSpeed = 128;
  //port_power_factor_gauge.set(400); 
  pms.gauges.port_power_factor_gauge = port_power_factor_gauge;


  // STBD Gauges
  const stbd_volts = document.getElementById('stbd-volts');
  const stbd_volts_gauge = new Gauge(stbd_volts).setOptions(opts);
  stbd_volts_gauge.maxValue = 500; 
  stbd_volts_gauge.setMinValue(0);
  stbd_volts_gauge.animationSpeed = 128; 
  //stbd_volts_gauge.set(0); 
  pms.gauges.stbd_volts_gauge = stbd_volts_gauge;

  const stbd_amps = document.getElementById('stbd-amps'); 
  const stbd_amps_gauge = new Gauge(stbd_amps).setOptions(opts);
  stbd_amps_gauge.maxValue = 200;
  stbd_amps_gauge.setMinValue(0);
  stbd_amps_gauge.animationSpeed = 128;
  //stbd_amps_gauge.set(400);
  pms.gauges.stbd_amps_gauge = stbd_amps_gauge;



  const stbd_frec = document.getElementById('stbd-frec');
  const stbd_frec_gauge = new Gauge(stbd_frec).setOptions(opts);
  stbd_frec_gauge.maxValue = 60;
  stbd_frec_gauge.setMinValue(0);
  stbd_frec_gauge.animationSpeed = 128;
  //stbd_frec_gauge.set(400);
  pms.gauges.stbd_frec_gauge = stbd_frec_gauge;

  const stbd_factor = document.getElementById('stbd-power-factor');
  const stbd_power_factor_gauge = new Gauge(stbd_factor).setOptions(opts);
  stbd_power_factor_gauge.maxValue = 1;
  stbd_power_factor_gauge.setMinValue(0);
  stbd_power_factor_gauge.animationSpeed = 128;
  //stbd_power_factor_gauge.set(400); 
  pms.gauges.stbd_power_factor_gauge = stbd_power_factor_gauge;
}


function initEvents() {
  const thruster_auto = document.getElementById('thruster-auto-on-off');
  thruster_auto.addEventListener('click', function() {
    let cmd = '';
    if(!pms.thruster_auto) {
        cmd = 'on';
    } else {
      cmd = 'off';
    }
    (async () => {
      const rawResponse = await fetch('thruster_auto_manual', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({'truster_auto': cmd})
      });

    })();
  });

  const port_start = document.getElementById('port-on-off')
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

  const stbd_start = document.getElementById('stbd-on-off')
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
    })();
  });

  /// Parallel section
  const port_auto = document.getElementById('port-auto-manual')
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
  });

  const stbd_auto = document.getElementById('stbd-auto-manual')
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
  });

  // Close Open breakers
  const port_close_open = document.getElementById('port-close-open')
  port_close_open.addEventListener('click', function() {
    let cmd = pms.port_gen.breaker ? 'open_port' : 'close_port';
    (async () => {
      const rawResponse = await fetch('add_cmd', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({'cmd': cmd})
      });
    })();
  });

  const stbd_close_open = document.getElementById('stbd-close-open')
  stbd_close_open.addEventListener('click', function() {
    let cmd = pms.stbd_gen.breaker ? 'open_stbd' : 'close_stbd';
    (async () => {
      const rawResponse = await fetch('add_cmd', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({'cmd': cmd})
      });
    })();
  });
}

function updatePMS(content) {

    pms.connected = content['connected'];
    pms.thruster_auto = content['pms']['thruster_auto'];
    document.getElementById('thruster-auto-on-off').innerText = pms.thruster_auto ? 'AUTO': 'MANUAL';
    document.getElementById('thruster-status-indicator').style.backgroundColor = pms.thruster_auto ? 'green' : 'red';

    // Update Port gauges and state
    let port_volts = parseInt(parseInt(content['pms']['port_volts']) / 10) || 0;
    pms.gauges.port_volts_gauge.set(port_volts);
    pms.port_volts_text.innerText = `${port_volts}V`;

    let port_amps = parseInt(parseInt(content['pms']['port_current']) / 10) || 0;
    pms.gauges.port_amps_gauge.set(port_amps);
    pms.port_amps_text.innerText = `${port_amps}A`;

    let port_frec = parseInt(parseInt(content['pms']['port_frec']) / 10) || 0;
    pms.gauges.port_frec_gauge.set(port_frec);
    pms.port_frec_text.innerText = `${port_frec}Hz`;

    let port_power_factor = parseInt(content['pms']['port_cos']) / 10000 || 0;
    pms.gauges.port_power_factor_gauge.set(port_power_factor);
    pms.port_power_factor_text.innerText = `${port_power_factor}PF`;
    
    pms.port_cooldown = parseInt(content['pms']['cooldown_port']);
    

    // Update STBD gauges and state
    let stbd_volts = parseInt(parseInt(content['pms']['stbd_volts']) / 10);
    pms.gauges.stbd_volts_gauge.set(stbd_volts);
    pms.stbd_volts_text.innerText = stbd_volts;

    let stbd_amps = parseInt(parseInt(content['pms']['stbd_current']) / 10);
    pms.gauges.stbd_amps_gauge.set(stbd_amps);
    pms.stbd_amps_text.innerText = stbd_amps;

    let stbd_frec = parseInt(parseInt(content['pms']['stbd_frec']) / 10);
    pms.gauges.stbd_frec_gauge.set(stbd_frec);
    pms.stbd_frec_text.innerText = stbd_frec;

    let stbd_power_factor = parseInt(parseInt(content['pms']['stbd_cos']) / 1000);
    pms.gauges.stbd_power_factor_gauge.set(stbd_power_factor);
    pms.stbd_power_factor_text.innerText = stbd_power_factor; 

    pms.stbd_cooldown = parseInt(content['pms']['cooldown_stbd']);
}
   
function init() {
  initGauges();

  const data_logger = setInterval(function() {
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
      console.log(content)
      updatePMS(content)
    })();
  }, 500);

  initEvents();
}