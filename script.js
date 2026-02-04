const fileInput = document.getElementById('fileInput')
const trackInfo = document.querySelector('.track-info')

const playBtn = document.getElementById('playBtn')
const pauseBtn = document.getElementById('pauseBtn')

const progress = document.querySelector('.progress')
const progressContainer = document.querySelector('.progress-container')

const currentTimeEl = document.getElementById('currentTime')
const durationEl = document.getElementById('duration')

// Audio element

const audio = new Audio()
audio.preload = 'metadata'

fileInput.addEventListener('change', (e) => {
  const file = e.target.files[0]
  if (!file) return

  trackInfo.textContent = file.name

  const objectURL = URL.createObjectURL(file)

  audio.src = objectURL

  progress.style.width = '0%'
  currentTimeEl.textContent = '0:00'
  durationEl.textContent = '0:00'

  playBtn.disabled = true
  pauseBtn.style.display = 'none'
  playBtn.style.display = 'inline-block'
})

audio.addEventListener('loadedmetadata', () => {
  playBtn.disabled = false

  const duration = audio.duration
  durationEl.textContent = formatTime(duration)
})

function formatTime(seconds) {}
