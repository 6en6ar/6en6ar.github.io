var templates = document.getElementsByClassName('templates')[0];
var terminal = {
  CONFIG: {
    typingSpeed: 80,
    waitBeforeNextCommand: 1000,
    prefix: 'g3n6aR@darkside: ~/dev/shm # ',
    commands: [
      {
        content: 'Hello stranger. Welcome to my portfolio!'
      },
      {
        content: 'cat info.txt',
        output: {
          color: 'red',
          list: [
            '---> Cyber security researcher',
            '---> Penetration tester, Red teamer, Developer and Malware analyst ',
            '---> In love with everything Cyber !',
            '---> Executing backdoor.....'
          ]
        }
      },
      {
        content: ' '
      }
    ]
  },
  
  currentCommand: 0,
  
  dom: {
    terminal: null,
    command: null
  },
  
  init: function() {
    this.dom.terminal = document.getElementsByClassName('terminal')[0];
    this.dom.command = templates.getElementsByClassName('terminal-command')[0];
    
    this.start();
  },
  
  start: function() {
    this.nextCommand();
  },
  
  nextCommand: function() {
    setTimeout(function() {
      if (terminal.currentCommand < terminal.CONFIG.commands.length) {
        terminal.addCommand(terminal.CONFIG.commands[terminal.currentCommand++]);
      }
    }, terminal.CONFIG.waitBeforeNextCommand)
  },
  
  addCommand: function(data) {
    var commandEl = this.createCommandEl();
    
    this.dom.terminal.appendChild(commandEl);
    
    this.typeWrite(commandEl.getElementsByClassName('content')[0], data);
  },
  
  typeWrite: function(el, data) {
    var whatArr = data.content.split('');
    var index = 0;
    
    function type() {
      el.textContent += whatArr[index++];
      
      if (index < whatArr.length) {
        setTimeout(function() {
          type();
        }, terminal.CONFIG.typingSpeed);
      } else {
        if (data.output) {
          terminal.createOutput(data.output);
        }
        
        terminal.nextCommand();
      }
    }
    
    type();
  },
  
  createCommandEl: function() {
    var commandEl = this.dom.command.cloneNode(true);
    commandEl.getElementsByClassName('prefix')[0].textContent = this.CONFIG.prefix;
    
    return commandEl;
  },
  
  createOutput: function(data) {
    let outputEl = document.createElement('div')
    outputEl.className = 'terminal-output';
    outputEl.style.color = data.color;
    
    for (var i = 0; i < data.list.length; i += 1) {
      outputEl.textContent = data.list[i];
      terminal.dom.terminal.appendChild(outputEl.cloneNode(true));
    }
  },
};

terminal.init()