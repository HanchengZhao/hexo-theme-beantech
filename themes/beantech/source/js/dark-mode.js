;(function(){
  'use strict';
  function applyTheme(theme){
    if(theme === 'dark') document.documentElement.classList.add('dark-mode');
    else document.documentElement.classList.remove('dark-mode');
  }

  try{
    var stored = localStorage.getItem('theme');
    if(stored){ applyTheme(stored); }
    else {
      var m = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)');
      if(m && m.matches) applyTheme('dark');
    }
  }catch(e){}

  // Prevent browser scroll restoration and embedded content from stealing focus/scroll
  if ('scrollRestoration' in window.history) {
    window.history.scrollRestoration = 'manual';
  }
  // Ensure page always loads at top
  window.addEventListener('load', function() {
    window.scrollTo(0, 0);
  });

  document.addEventListener('DOMContentLoaded', function(){
    var btn = document.getElementById('darkModeToggle');
    function setIcon(isDark){
      if(!btn) return;
      var icon = btn.querySelector('i');
      if(!icon) return;
      icon.classList.toggle('fa-moon-o', !isDark);
      icon.classList.toggle('fa-sun-o', isDark);
    }

    if(btn){
      btn.addEventListener('click', function(e){
        e.preventDefault();
        var isDark = document.documentElement.classList.toggle('dark-mode');
        try{ localStorage.setItem('theme', isDark ? 'dark' : 'light'); }catch(e){}
        setIcon(isDark);
      });
      // initialize icon state
      setIcon(document.documentElement.classList.contains('dark-mode'));
    }

    // respond to OS changes if user hasn't chosen
    var mq = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)');
    if(mq){
      var listener = function(e){
        if(!localStorage.getItem('theme')) applyTheme(e.matches ? 'dark' : 'light');
        if(btn) setIcon(document.documentElement.classList.contains('dark-mode'));
      };
      if(mq.addEventListener) mq.addEventListener('change', listener);
      else if(mq.addListener) mq.addListener(listener);
    }
  });
})();
