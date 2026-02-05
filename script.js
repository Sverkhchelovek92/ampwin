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

function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) return '0:00'
  const min = Math.floor(seconds / 60)
  const sec = Math.floor(seconds % 60)
  return `${min}:${sec.toString().padStart(2, '0')}`
}

// Play and Pause btns

playBtn.addEventListener('click', () => {
  audio.play().catch((err) => {
    console.error('Playback error:', err)
    return
  })

  playBtn.style.display = 'none'
  pauseBtn.style.display = 'inline-block'
  pauseBtn.disabled = false
  playBtn.disabled = true
})

pauseBtn.addEventListener('click', () => {
  audio.pause()

  pauseBtn.style.display = 'none'
  playBtn.style.display = 'inline-block'

  playBtn.disabled = false
  pauseBtn.disabled = true
})

audio.addEventListener('pause', () => {
  pauseBtn.style.display = 'none'
  playBtn.style.display = 'inline-block'
})

audio.addEventListener('ended', () => {
  pauseBtn.style.display = 'none'
  playBtn.style.display = 'inline-block'
  progress.style.width = '0%'
  currentTimeEl.textContent = '0:00'
})
