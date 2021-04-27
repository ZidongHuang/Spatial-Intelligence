try { window.regltick.cancel() } catch (e) {}
console.clear()

var sel = d3.select('#graph').html('')

c = d3.conventions({
  sel,
  layers: 'ds',
  margin: { left: 0, bottom: 0, right: 0, top: 0 },
  width: 960,
  height: 500
})

var count = 20000
var yScale = d3.scaleLinear()
  .domain([0, 4])
  .range([-0.8, 0.8])

var wScale = d3.scaleThreshold()
  .domain([0.1, 0.2, 0.35, 0.6])
  .range([0, 1, 2, 3, 4])

var bScale = d3.scaleThreshold()
  .domain([0.21, 0.42, 0.63, 0.83])
  .range([0, 1, 2, 3, 4])

var data = d3.range(count).map(i => {
  var isB = i % 2
  var q = (isB ? bScale : wScale)(i / count)

  return {
    speed: Math.random() * 2 + 1,
    x: Math.random() * 2 - 1,
    y0: yScale(0),
    y1: yScale(q),
    dy: Math.random() * 0.2,
    isB
  }
})

data = _.shuffle(data)

c.x.range([0, c.width])
c.y.range([c.height, 0])

reglLib({ onDone, container: c.layers[0].node() })

function onDone(err, regl) {
  if (err) return console.log(err)
  window.regl = regl

  var drawPoints = regl({
    vert: `
      precision mediump float;
      attribute float speed, x, y0, y1, dy;
      attribute float isB;
      varying float c;
      uniform float interp;      
      void main() {
        float t = mod(x + interp*speed, 1.0);
        
        // cubic ease
        float ct = t < 0.5
          ? 4.0 * t * t * t
          : -0.5 * pow(abs(2.0 * t - 2.0), 3.0) + 1.0;

        float x = mix(-1.0, 1.0, t);
        float y = mix(y0, y1, ct);

        gl_Position = vec4(x, y + dy, 0, 1);
        gl_PointSize = 4.0;

        c = isB;
      }`,

    frag: `
      precision mediump float;
      varying float c;
      void main() {
        vec4 blue = vec4(0.00, 0.65, 1.00, 1);
        vec4 orng = vec4(0.99, 0.45, .011, 1);

        gl_FragColor = c == 1.0 ? blue : orng;
      }`,

    attributes: {
      speed: data.map(d => d.speed),
      x:  data.map(d => d.x),
      y0: data.map(d => d.y0),
      y1: data.map(d => d.y1),
      dy: data.map(d => d.dy),
      isB: data.map(d => d.isB)
    },
    uniforms: {
      interp: (ctx, props) => props.interp
    },
    primitive: 'point',
    count
  })

  window.regltick = regl.frame(({ time }) => {
    drawPoints({ interp: time / 40 })
  })
}
