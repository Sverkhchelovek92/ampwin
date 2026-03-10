const fileInput = document.getElementById('fileInput')

const trackName = document.getElementById('trackName')
const trackWrapper = document.getElementById('marqueeWrapper')
const trackItem = document.getElementById('marqueeItem')

const playBtn = document.getElementById('playBtn')
const pauseBtn = document.getElementById('pauseBtn')
const stopBtn = document.getElementById('stopBtn')
const prevBtn = document.getElementById('prevBtn')
const nextBtn = document.getElementById('nextBtn')
const loopBtn = document.getElementById('loopBtn')

const progress = document.querySelector('.seek-knob')
const progressContainer = document.querySelector('.progress-container')

const currentTimeEl = document.getElementById('currentTime')
const durationEl = document.getElementById('duration')

const volumeSlider = document.getElementById('volume')
const balanceSlider = document.getElementById('balance')

let isLoopEnabled = false

let currentFile = null

// Audio element

const audio = new Audio()
audio.preload = 'metadata'

audio.volume = 1

// Audio context

let audioCtx = null
let sourceNode = null
let splitter = null
let merger = null
let leftGain = null
let rightGain = null
let balanceValue = 0

function buildMarquee(text) {
  trackWrapper.innerHTML = ''

  const base = document.createElement('span')
  base.className = 'marquee-item'
  base.textContent = text

  trackWrapper.appendChild(base)

  const containerWidth = trackName.offsetWidth
  const textWidth = base.offsetWidth

  const count = Math.ceil(containerWidth / textWidth) + 2

  for (let i = 0; i < count; i++) {
    const clone = base.cloneNode(true)
    trackWrapper.appendChild(clone)
  }

  const distance = textWidth

  const duration = distance / 20

  trackWrapper.style.animation = `marquee ${duration}s linear infinite`

  const style = document.createElement('style')
  style.innerHTML = `
    @keyframes marquee {
      from { transform: translateX(0); }
      to { transform: translateX(-${distance}px); }
    }
  `
  document.head.appendChild(style)
}

fileInput.addEventListener('change', (e) => {
  const file = e.target.files[0]
  if (!file) return

  currentFile = file

  const newTitle = file.name

  buildMarquee(newTitle)

  const objectURL = URL.createObjectURL(file)

  audio.src = objectURL

  document.getElementById('kbpsDisplay').textContent = '--'
  document.getElementById('khzDisplay').textContent = '--'

  // progress.style.width = '0%'
  currentTimeEl.textContent = '0:00'

  playBtn.disabled = true
  pauseBtn.style.display = 'none'
  playBtn.style.display = 'inline-block'
})

audio.addEventListener('loadedmetadata', () => {
  playBtn.disabled = false

  const duration = audio.duration
  if (!duration || isNaN(duration) || duration <= 0) return

  // kHz

  const audioCtx = new (window.AudioContext || window.webkitAudioContext)()
  const sampleRate = audioCtx.sampleRate

  document.getElementById('khzDisplay').textContent = (
    sampleRate / 1000
  ).toFixed(1)

  // kbps

  if (currentFile && currentFile.size) {
    const bitrate = Math.round((currentFile.size * 8) / duration / 1000)
    document.getElementById('kbpsDisplay').textContent = bitrate
  }
})

function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) return '0:00'
  const min = Math.floor(seconds / 60)
  const sec = Math.floor(seconds % 60)
  return `${min}:${sec.toString().padStart(2, '0')}`
}

// Progress bar

function updateProgress() {
  if (!audio.duration || isNaN(audio.duration)) return

  const percent = audio.currentTime / audio.duration

  const trackWidth = progressContainer.clientWidth
  const knobWidth = progress.offsetWidth

  const position = percent * (trackWidth - knobWidth)

  progress.style.left = `${position}px`

  currentTimeEl.textContent = formatTime(audio.currentTime)
}

// End (Stop) State

function showEndedState() {
  pauseBtn.style.display = 'none'
  playBtn.style.display = 'inline-block'

  stopBtn.disabled = true
  playBtn.disabled = false

  progress.style.left = '0px'
  currentTimeEl.textContent = '0:00'
}

// Play and Pause btns

playBtn.addEventListener('click', () => {
  initAudioGraph()
  audio.play().catch((err) => {
    console.error('Playback error:', err)
    return
  })

  playBtn.style.display = 'none'
  pauseBtn.style.display = 'inline-block'
  pauseBtn.disabled = false
  stopBtn.disabled = false
  playBtn.disabled = true
})

pauseBtn.addEventListener('click', () => {
  audio.pause()

  pauseBtn.style.display = 'none'
  playBtn.style.display = 'inline-block'

  playBtn.disabled = false
  pauseBtn.disabled = true
})

stopBtn.addEventListener('click', () => {
  audio.pause()

  audio.currentTime = 0

  showEndedState()

  updateProgress()
})

audio.addEventListener('pause', () => {
  pauseBtn.style.display = 'none'
  playBtn.style.display = 'inline-block'
})

audio.addEventListener('ended', () => {
  if (isLoopEnabled) {
    audio.currentTime = 0
    audio.play()
  } else {
    showEndedState()
  }
})

// Volume slider

volumeSlider.addEventListener('input', () => {
  audio.volume = parseFloat(volumeSlider.value)
})

// Progress slider

audio.addEventListener('timeupdate', updateProgress)

audio.addEventListener('play', () => {
  updateProgress()
})

// Progress click

progressContainer.addEventListener('click', (e) => {
  if (!audio.duration || isNaN(audio.duration) || audio.duration <= 0) {
    return
  }

  const rect = progressContainer.getBoundingClientRect()
  const clickX = e.clientX - rect.left

  const percent = clickX / rect.width

  audio.currentTime = percent * audio.duration

  updateProgress()
})

// Loop button

loopBtn.addEventListener('click', () => {
  isLoopEnabled = !isLoopEnabled

  if (isLoopEnabled) {
    loopBtn.classList.add('active')
  } else {
    loopBtn.classList.remove('active')
  }
})

// Balance logic

function initAudioGraph() {
  if (audioCtx) return

  audioCtx = new (window.AudioContext || window.webkitAudioContext)()

  sourceNode = audioCtx.createMediaElementSource(audio)

  splitter = audioCtx.createChannelSplitter(2)

  leftGain = audioCtx.createGain()
  rightGain = audioCtx.createGain()

  merger = audioCtx.createChannelMerger(2)

  sourceNode.connect(splitter)

  splitter.connect(leftGain, 0)
  splitter.connect(rightGain, 1)

  leftGain.connect(merger, 0, 0)
  rightGain.connect(merger, 0, 1)

  merger.connect(audioCtx.destination)

  updateBalance()
}

function updateBalance() {
  if (!leftGain || !rightGain) return

  let leftVol = 1
  let rightVol = 1

  if (balanceValue < 0) {
    rightVol = 1 + balanceValue
  } else if (balanceValue > 0) {
    leftVol = 1 - balanceValue
  }

  leftGain.gain.value = leftVol
  rightGain.gain.value = rightVol
}

balanceSlider.addEventListener('input', () => {
  balanceValue = parseFloat(balanceSlider.value)
  updateBalance()
})
