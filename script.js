const fileInput = document.getElementById('fileInput')
// const trackInfo = document.querySelector('.track-info')
const trackName = document.querySelector('.track-name')

const playBtn = document.getElementById('playBtn')
const pauseBtn = document.getElementById('pauseBtn')

const progress = document.querySelector('.progress')
const progressContainer = document.querySelector('.progress-container')

const currentTimeEl = document.getElementById('currentTime')
const durationEl = document.getElementById('duration')

const volumeSlider = document.getElementById('volume')

// Audio element

const audio = new Audio()
audio.preload = 'metadata'

audio.volume = 1

fileInput.addEventListener('change', (e) => {
  const file = e.target.files[0]
  if (!file) return

  trackName.textContent = file.name

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

// Progress bar

function updateProgress() {
  if (!audio.duration || isNaN(audio.duration)) return

  const progressPercent = (audio.currentTime / audio.duration) * 100
  progress.style.width = `${progressPercent}%`

  currentTimeEl.textContent = formatTime(audio.currentTime)
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

// Volume slider

volumeSlider.addEventListener('input', () => {
  audio.volume = parseFloat(volumeSlider.value)
})

// Progress slider

audio.addEventListener('timeupdate', updateProgress)

audio.addEventListener('play', () => {
  updateProgress() // сразу обновить
})

// Progress click

progressContainer.addEventListener('click', (e) => {
  if (!audio.duration || isNaN(audio.duration) || audio.duration <= 0) {
    return
  }

  const rect = progressContainer.getBoundingClientRect()
  if (rect.width <= 0) return

  const clickX = e.clientX - rect.left
  let percent = clickX / rect.width

  percent = Math.max(0, Math.min(1, percent))

  const newTime = percent * audio.duration

  audio.currentTime = newTime

  updateProgress()
})
