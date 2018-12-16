// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const remote = require('electron').remote;
const fs = require('fs');
const path = require('path')
const config = JSON.parse(fs.readFileSync('assets/config.json', 'utf8'))
var skilltree = JSON.parse(fs.readFileSync(path.join(config.assetsPath, 'data/skilltree.json'), 'utf8'))

function Sleep (milliseconds) {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}

async function SuperDeletoById (time, id) {
  await Sleep (time);
  let element = document.getElementById(id);
  element.parentNode.removeChild(element);
}

document.onreadystatechange = () => {
    if (document.readyState == 'complete') {
      handleWindowControls();
      ButtonClickEvents();
    }
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
        return;
      }
      let notifBox = document.createElement('div');
      notifBox.setAttribute('class', 'notification');
      notifBox.setAttribute('id', 'notifBox');

      let span = document.createElement('span');
      span.innerHTML = 'Saved!';
      notifBox.appendChild(span);

      document.getElementById('main').appendChild(notifBox);

      SuperDeletoById(3000, 'notifBox');
    });
  });
}
