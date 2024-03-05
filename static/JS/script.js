// Function to preload website content
function renderWebsite(filepath) {
  fetch(filepath)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.text();
    })
    .then(data => {
      var slideshowContainer = document.querySelector('.slideshow-container');
      var slide = document.createElement('div');
      slide.classList.add('websiteSlide'); // Assigning both classes
      var iframe = document.createElement('iframe');
      iframe.src = data; // Set src to the URL of the website
      console.log(data);
      iframe.style.width = "100vw"; // Set width to 100% of viewport width
      iframe.style.height = "100vh"; // Set height to 100% of viewport height
      iframe.style.position = "fixed"; // Position the iframe fixed to the viewport
      iframe.style.top = "0"; // Align iframe to the top
      iframe.style.left = "0"; // Align iframe to the left
      iframe.style.border = "none"; // Remove border for better appearance
      slide.appendChild(iframe);
      slideshowContainer.appendChild(slide);
      // Add the rendered slide to the slides array
      slidesArray.push(slide);
    })
    .catch(error => console.error('Error fetching or rendering website:', error));
}

// Array to store slides
var slidesArray = [];

// Function to render a slide with an image and add it to the array
function renderImage(filepath) {
  var slideshowContainer = document.querySelector('.slideshow-container');
  var slide = document.createElement('div');
  slide.classList.add('imageSlide');
  var img = document.createElement('img');
  img.src = filepath; // Assuming the file object contains the file path
  slide.appendChild(img);
  slideshowContainer.appendChild(slide);
  // Add the rendered slide to the slides array
  slidesArray.push(slide);
}

// Function to render a slide with a table and add it to the array
function renderTable(file) {
  const excelFilePath = file.filepath;

  fetch(excelFilePath)
    .then(response => response.arrayBuffer())
    .then(buffer => {
      const data = new Uint8Array(buffer);
      const workbook = XLSX.read(data, {type: 'array'});
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet, {header: 1});
      displayTable(jsonData);

      // Add the class 'tableSlide' to the slide element
      const slide = document.querySelector('.slideshow-container').lastElementChild;
      slide.classList.add('tableSlide');
      
      // Add the slide to the slides array
      slidesArray.push(slide);
    })
    .catch(error => console.error('Error fetching Excel file:', error));
}

// Function to display the table slide
function displayTable(data) {
  var slideshowContainer = document.querySelector('.slideshow-container');

  const table = document.createElement('table');
  for (let row of data) {
    const tr = document.createElement('tr');
    for (let cell of row) {
      const td = document.createElement('td');
      // Check if the cell value is a date (assuming it's in the first column)
      if (row.indexOf(cell) === 0 && !isNaN(Date.parse(cell))) {
        // Parse the date and format it
        const formattedDate = new Date(cell).toLocaleDateString('en-US');
        td.textContent = formattedDate;
      } else {
        td.textContent = cell;
      }
      tr.appendChild(td);
    }
    table.appendChild(tr);
  }
  // Append the table as a slide
  var slide = document.createElement('div');
  slide.classList.add('mySlides');

  // Set background color for the slide containing the Excel table
  slide.style.backgroundColor = 'white';

  var h1 = document.createElement('h1');
  h1.textContent = 'Table';
  h1.style.textAlign = 'center'; // Center the text horizontally
  slide.appendChild(h1);

  slide.appendChild(table);
  slideshowContainer.appendChild(slide);
}

// Function to render a slide with a video and add it to the array
function renderVideo(filepath) {
  var slideshowContainer = document.querySelector('.slideshow-container');
  var slide = document.createElement('div');
  slide.classList.add('videoSlide'); // Assigning both classes
  var video = document.createElement('video');
  video.src = filepath;
  video.autoplay = true; // Add autoplay attribute
  video.addEventListener('loadedmetadata', function() {
    // Store video duration as a data attribute
    slide.dataset.videoDuration = Math.floor(video.duration * 1000); // Convert to milliseconds
  });
  slide.appendChild(video);
  slideshowContainer.appendChild(slide);
  // Add the rendered slide to the slides array
  slidesArray.push(slide);
}

// Function to show slides from the array in a loop
function showSlidesLoop() {
  var currentIndex = 0;

  // Function to display the current slide
  function showSlide(slide, timer) {
    // Hide all slides
    slidesArray.forEach(slide => slide.style.display = 'none');
    // Show the current slide
    slide.style.display = 'block';

    // Check if the current slide is a video slide and play the video
    if (slide.classList.contains('videoSlide')) {
      var video = slide.querySelector('video');
      video.currentTime = 0; // Rewind to beginning
      video.play(); // Start playing
      // Set a timeout to pause the video after its duration
      setTimeout(function() {
        video.pause();
      }, timer);
    }

    // Call showSlide function recursively after a certain delay
    setTimeout(function() {
      // Move to the next slide
      currentIndex = (currentIndex + 1) % slidesArray.length;
      var nextSlide = slidesArray[currentIndex];
      if (nextSlide.classList.contains('imageSlide')) {
        // If next slide is an image slide or a video slide
        showSlide(nextSlide, 2000); // Adjust the delay as needed
      } else if (nextSlide.classList.contains('websiteSlide')) {
        // If next slide is a website slide
        showSlide(nextSlide, 20000); // Adjust the delay as needed
      } else if (nextSlide.classList.contains('tableSlide')) {
        // If next slide is a table slide, show for 10 seconds
        showSlide(nextSlide, 20000);
      } else if (nextSlide.classList.contains('videoSlide')) {
        // If next slide is a video slide, set for duration of the video
        const video = nextSlide.querySelector('video');
        showSlide(nextSlide, nextSlide.dataset.videoDuration || video.duration * 1000);
      }
    }, timer); // Set the display duration
  }

  // Start the slideshow after a delay of 3 seconds
  setTimeout(function() {
    // Start showing slides based on their position in the slidesArray
    showSlide(slidesArray[currentIndex], 2000); // Start with a timer of 2 seconds for images
  }, 3000); // 3000 milliseconds = 3 seconds
}






// Function to fetch files and display them on website load
function fetchAndDisplayFiles() {
  // Fetch files from the server
  fetch('/TVSlideShow/get_files')
      .then(response => response.json())
      .then(data => {
          console.log('Received data:', data); // Check the received data structure
          if (data.files) {
              // Distribute files to display functions based on their types
              data.files.forEach(file => {
                  switch (file.filetype) {
                      case 'image':
                          renderImage(file.filepath); // Pass filepath instead of the entire file object
                          break;
                      case 'excel':
                          renderTable(file);
                          break;
                      case 'text':
                          renderWebsite(file.filepath);
                          break;
                      case 'video':
                          renderVideo(file.filepath);
                          break;
                      default:
                          console.error('Unknown file type:', file.filetype);
                          break;
                  }
              });
              // Start slideshow loop after all slides are rendered
              showSlidesLoop();
          } else {
              console.log('No files received from the server');
          }
      })
      .catch(error => console.error('Error fetching files:', error));
}

// Function to fetch files and display them on website load
window.onload = function() {
    fetchAndDisplayFiles();

    // Fetch files and display them every hour
    setInterval(fetchAndDisplayFiles, 3600000); // 3600000 milliseconds = 1 hour
};
