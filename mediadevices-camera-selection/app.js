const video = document.getElementById('video')
const button = document.getElementById('button')
const select = document.getElementById('select')

// mediaDevices API 请求摄像头权限
// 调用  navigator.mediaDevices.getUserMedia
// media constraints 对象
button.addEventListener('click', event => {
  // 判断 是否有当前媒体流currentStream
  if (typeof currentStream !== 'undefined') {
    stopMediaTracks(currentStream)
  }
  // 通过使用 facingMode 和 deviceId 约束来选择用户的摄像头。在你有权限使用摄像头之前，facingMode 更可靠，但是选择 deviceId 更加精确
  // FacingMode (https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints/facingMode) 约束是一个可以用来选择摄像头的替代方法
  // 四种选项可供你选择：用户（user）-> 前摄像头，环境（environment）-> 后摄像头，左（left），右（right）
  const videoConstraints = {};
  if (select.value === '') {
    videoConstraints.facingMode = 'environment';
  } else {
    videoConstraints.deviceId = { exact: select.value };
  }
  const constraints = {
    video: videoConstraints,
    audio: false
  }
  navigator.mediaDevices.getUserMedia(constraints).then(stream => {
    // 当我们获得使用视频的权限时，在点击处理函数内，我们还要修改一些别的东西。把传递给函数的新流赋值给 currentStream 以便后续调用 stop，触发另一次 enumerateDevices 的调用。
    currentStream = stream
    video.srcObject = stream
    // enumerateDevices 返回一个 promise，所以在我们的 then 函数中可以直接返回它，然后链式创建一个新的 then 把结果传递给 gotDevices 函数处理
    return navigator.mediaDevices.enumerateDevices()
  })
  .then(gotDevices)
  .catch(error => {
    console.error(error)
  })
})

// 获取可枚举的设备
navigator.mediaDevices.enumerateDevices().then(gotDevices)

// 接收一个媒体流，循环遍历流中的每一个媒体轨道，调用 stop 方法停止媒体轨
function stopMediaTracks(stream) {
  stream.getTracks().forEach(track => {
    track.stop()
  })
}

// 获取设备id，并拼接在select上
function gotDevices(mediaDevices) {
  console.log('mediaDevices', mediaDevices)
  select.innerHTML = ''
  select.appendChild(document.createElement('option'))
  let count = 1
  mediaDevices.forEach(mediaDevice => {
    if (mediaDevice.kind === 'videoinput') {
      const option = document.createElement('option')
      option.value = mediaDevice.deviceId
      const label = mediaDevice.label || `Camera ${count++}`
      const textNode = document.createTextNode(label)
      option.appendChild(textNode)
      select.appendChild(option)
    }
  });
}
