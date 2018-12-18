// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const remote = require('electron').remote;
const fs = require('fs');
const path = require('path');
const config = JSON.parse(fs.readFileSync('assets/config.json', 'utf8'));
var skilltree = JSON.parse(fs.readFileSync(path.join(config.assetsPath, 'data/skilltree.json'), 'utf8'));

document.onreadystatechange = () => {
    if (document.readyState == 'complete') {
      handleWindowControls();
      ButtonClickEvents();
    }
}

Element.prototype.remove = function() {
  console.log("Element deleted!");
  console.log(this);
  this.parentElement.removeChild(this);
}
NodeList.prototype.remove = HTMLCollection.prototype.remove = function() {
  console.log("Element deleted!");
  console.log(this);
  for(var i = this.length - 1; i >= 0; i--) {
    if(this[i] && this[i].parentElement) {
      this[i].parentElement.removeChild(this[i]);
    }
  }
}

function animate({duration, draw, timing}) {

  let start = performance.now();

  requestAnimationFrame(function animate(time) {
    let timeFraction = (time - start) / duration;
    if (timeFraction > 1) timeFraction = 1;

    let progress = timing(timeFraction)

    draw(progress);

    if (timeFraction < 1) {
      requestAnimationFrame(animate);
    }

  });
}

function Sleep (milliseconds) {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}

var IDCount = 0;
async function CreateNotification (message = ' ', time = 3000) {
  let notifBox = document.createElement('div');
  notifBox.setAttribute('class', 'notification');
  let currentID = IDCount;
  notifBox.setAttribute('id', 'notifBox' + IDCount++);

  let span = document.createElement('span');
  span.innerHTML = message;

  notifBox.appendChild(span);
  document.getElementById('main').appendChild(notifBox);
  console.log('Notification created!');

  notifBox = document.getElementById('notifBox' + currentID);

  animate({
    duration: time/2,
    timing: function(timeFraction) {
      // ease-out
      return - timeFraction * (timeFraction - 2);
    },
    draw: function(progress) {
      // start + progress (0-1) * destination
      notifBox.style.top = - 100 + progress * 120 + 'px';
    }
  });
  await Sleep(time * 0.75);
  animate({
    duration: time * 0.25,
    timing: function(timeFraction) {
      return 1 - timeFraction;
    },
    draw: function(progress) {
      notifBox.style.opacity = progress;
    }
  });
  await Sleep(time * 0.25);
  notifBox.remove();
}

function handleWindowControls() {
  // When document has loaded, initialise
  let window = remote.getCurrentWindow();
  const minButton = document.getElementById('min-button'),
        maxButton = document.getElementById('max-button'),
        restoreButton = document.getElementById('restore-button'),
        closeButton = document.getElementById('close-button');

  minButton.addEventListener('click', event => {
    window = remote.getCurrentWindow();
    window.minimize();
  });

  maxButton.addEventListener('click', event => {
    window = remote.getCurrentWindow();
    window.maximize();
    toggleMaxRestoreButtons();
  });

  restoreButton.addEventListener('click', event => {
    window = remote.getCurrentWindow();
    window.unmaximize();
    toggleMaxRestoreButtons();
  });

  // Toggle maximise/restore buttons when maximisation/unmaximisation
  // occurs by means other than button clicks e.g. double-clicking
  // the title bar:
  toggleMaxRestoreButtons();
  window.on('maximize', toggleMaxRestoreButtons);
  window.on('unmaximize', toggleMaxRestoreButtons);

  closeButton.addEventListener('click', event => {
    window = remote.getCurrentWindow();
    window.close();
  });
  function toggleMaxRestoreButtons() {
    window = remote.getCurrentWindow();
    if (window.isMaximized()) {
      maxButton.style.display = 'none';
      restoreButton.style.display = 'flex';
    } else {
      restoreButton.style.display = 'none';
      maxButton.style.display = 'flex';
    }
  }
}

function ButtonClickEvents () {
  let window = remote.getCurrentWindow();
  const saveButton = document.getElementById('save');

  saveButton.addEventListener('click', event => {
    fs.writeFile('./output/skilltree.json', JSON.stringify(skilltree), err => {
      if (err) {
        console.error(err);
        CreateNotification('Save failed!');
        return;
      }

      CreateNotification('Saved!');
    });
  });
}
