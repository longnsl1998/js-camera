
// Lấy ra danh sách các thiết bị video (camera)
navigator.mediaDevices.enumerateDevices()
  .then(devices => {
    // Lọc ra các thiết bị là camera
    const cameras = devices.filter(device => device.kind === 'videoinput');

    // Lặp qua danh sách camera và hiển thị chúng trong dropdown
    const cameraSelect = document.getElementById('cameraSelect');
    cameras.forEach((camera, index) => {
      const option = document.createElement('option');
      option.value = camera.deviceId;
      option.text = camera.label || `Camera ${index + 1}`;
      cameraSelect.appendChild(option);
    });


    // Chọn camera đầu tiên mặc định
    const selectedCamera = cameras[0].deviceId;

    const constraints = {
      video: {
        deviceId: selectedCamera,
        width: { ideal: 1920 },
        height: { ideal: 1080 },
        frameRate: { ideal: 60, max: 120 } // 30 khung hình trên giây, tối đa 60 khung hình trên giây
      }
    };
    // Lấy stream từ camera đã chọn
    return navigator.mediaDevices.getUserMedia(constraints);
  })
  .then(stream => {
    // Tạo một element video để hiển thị hình ảnh từ camera
    const videoElement = document.createElement('video');
    videoElement.width = 1280;
    videoElement.height = 720;
    videoElement.srcObject = stream;
    videoElement.play();

    // Lắng nghe sự kiện khi người dùng thay đổi camera
    cameraSelect.addEventListener('change', () => {
      const selectedCameraId = cameraSelect.value;
      const constraints = {
        video: {
          deviceId: selectedCameraId,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 60, max: 120 } // 30 khung hình trên giây, tối đa 60 khung hình trên giây
        }
      };

      // Lấy stream từ camera đã chọn và hiển thị nó
      navigator.mediaDevices.getUserMedia(constraints)
        .then(stream => {
          videoElement.width = 1280;
          videoElement.height = 720;
          videoElement.srcObject = stream;
          videoElement.play();
        })
        .catch(error => {
          console.error('Lỗi khi lấy stream từ camera:', error);
        });
    });
    // Thêm video element vào DOM
    document.body.appendChild(videoElement);

    // Tạo một nút để chụp ảnh
    // const captureButton = document.createElement('button');
    // captureButton.textContent = 'Chụp ảnh';
    // document.body.appendChild(captureButton);

    let imageData = null;

    // Khi ấn nút chụp ảnh
    captureButton.addEventListener('click', () => {
      // Tạo canvas để vẽ hình ảnh từ video element
      const canvas = document.createElement('canvas');
      canvas.width = videoElement.videoWidth;
      // canvas.width = 1280;
      canvas.height = videoElement.videoHeight;
      // canvas.height = 720;
      const context = canvas.getContext('2d');
      context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

      // Lưu dữ liệu hình ảnh vào biến imageData
      imageData = canvas.toDataURL('image/jpeg');

      // Ẩn video stream
      videoElement.style.display = 'none';
      // Hiển thị ảnh đã chụp lên trang HTML và ẩn nút chụp ảnh, hiển thị nút "Chụp lại" và "Lưu ảnh"
      capturedImage.src = imageData;
      capturedImage.width = 1280;
      capturedImage.height = 720;
      capturedImage.style.display = 'block';
      captureButton.style.display = 'none';
      retryButton.style.display = 'inline-block';
      saveButton.style.display = 'inline-block';
    });

    // Khi ấn nút "Chụp lại"
    retryButton.addEventListener('click', () => {
      // Ẩn ảnh đã chụp, hiển thị lại nút chụp ảnh
      videoElement.style.display = 'block';
      capturedImage.style.display = 'none';
      retryButton.style.display = 'none';
      saveButton.style.display = 'none';
      captureButton.style.display = 'inline-block';
    });

    // Khi ấn nút "Lưu ảnh"
    saveButton.addEventListener('click', () => {
      // Gọi API để lưu ảnh
      fetch('API', {
        method: 'POST',
        body: JSON.stringify({ image: imageData }),
        headers: {
          'Content-Type': 'application/json'
        }
      })
        .then(response => {
          if (response.ok) {
            console.log('Ảnh đã được lưu thành công.');
          } else {
            console.error('Lỗi khi lưu ảnh.');
          }
        })
        .catch(error => {
          console.error('Lỗi khi gọi API lưu ảnh:', error);
        });
    });
  })
  .catch(error => {
    console.error('Lỗi khi truy cập camera:', error);
  });