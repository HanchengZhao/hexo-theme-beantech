/**
 * Chrome Built-in AI On-Device Translation Integration for Hexo BeanTech
 * Powered by Gemini Nano. Supports both Translator and window.translation interfaces.
 */

(function () {
  'use strict';

  // Supported target languages and their native labels
  const LANGUAGES = {
    'en': 'English',
    'zh': '简体中文',
    'ja': '日本語',
    'es': 'Español',
    'fr': 'Français',
    'de': 'Deutsch'
  };

  class BlogTranslator {
    constructor() {
      this.api = this.detectAPI();
      this.translators = new Map(); // Cache translator instances by 'source-target'
      this.originalLanguage = 'en'; // Will be dynamically detected on DOM ready
      this.currentLanguage = 'en';
      this.isTranslating = false;
      this.statusBanner = null;
      this.modalOverlay = null;

      this.init();
    }

    /**
     * Wraps a promise with a timeout rejection
     */
    promiseWithTimeout(promise, ms, timeoutErrorMsg) {
      let timeoutId;
      const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => {
          reject(new Error(timeoutErrorMsg || 'Operation timed out'));
        }, ms);
      });
      return Promise.race([promise, timeoutPromise]).finally(() => {
        clearTimeout(timeoutId);
      });
    }

    /**
     * Heuristically detects the dominant language of the page content within the container
     */
    detectDOMLanguage(container) {
      if (!container) return document.documentElement.lang || 'en';
      
      const htmlLang = document.documentElement.lang || 'en';
      
      // Sample text content from the container to run a fast heuristic
      const textNodes = [];
      this.collectTextNodes(container, textNodes);
      
      let sampledText = '';
      for (let i = 0; i < Math.min(textNodes.length, 30); i++) {
        sampledText += textNodes[i].textContent;
        if (sampledText.length > 1500) break;
      }

      if (!sampledText.trim()) return htmlLang.substring(0, 2).toLowerCase();

      // Clean up whitespace and punctuation
      const cleanText = sampledText.replace(/[\s\p{P}]+/gu, '');
      if (cleanText.length === 0) return htmlLang.substring(0, 2).toLowerCase();

      // Count characters by script type
      const chineseCharCount = (cleanText.match(/[\u4e00-\u9fa5]/g) || []).length;
      const japaneseCharCount = (cleanText.match(/[\u3040-\u309f\u30a0-\u30ff]/g) || []).length;
      const totalChars = cleanText.length;

      // Heuristic thresholds: if more than 12% is Chinese characters, it is most likely Chinese
      if (chineseCharCount / totalChars > 0.12) {
        return 'zh';
      }
      if (japaneseCharCount / totalChars > 0.12) {
        return 'ja';
      }

      // Default back to HTML language tag (or 'en')
      return htmlLang.substring(0, 2).toLowerCase();
    }

    /**
     * Detect and wrap the available browser Translation API
     */
    detectAPI() {
      if (typeof self !== 'undefined' && 'Translator' in self) {
        return {
          type: 'global',
          checkAvailability: async (options) => {
            try {
              return await self.Translator.availability(options);
            } catch (e) {
              console.warn('Translator.availability error:', e);
              return 'no';
            }
          },
          create: async (options) => {
            return await self.Translator.create(options);
          }
        };
      } else if (typeof window !== 'undefined' && window.translation && window.translation.canTranslate) {
        return {
          type: 'window',
          checkAvailability: async (options) => {
            try {
              const status = await window.translation.canTranslate(options);
              if (status === 'readily') return 'available';
              if (status === 'after-download') return 'downloadable';
              return 'no';
            } catch (e) {
              console.warn('translation.canTranslate error:', e);
              return 'no';
            }
          },
          create: async (options) => {
            return await window.translation.createTranslator(options);
          }
        };
      }
      return null;
    }

    init() {
      document.addEventListener('DOMContentLoaded', () => {
        const postContainer = document.querySelector('.post-container');
        if (postContainer) {
          this.originalLanguage = this.detectDOMLanguage(postContainer);
          this.currentLanguage = this.originalLanguage;
          console.log(`[Translation] Detected page language on load: ${this.originalLanguage}`);
        } else {
          this.originalLanguage = document.documentElement.lang || 'en';
          this.currentLanguage = this.originalLanguage;
        }
        this.setupUI();
        this.bindEvents();

        // Restore saved translation preference across pages
        this.restoreSavedTranslation();
      });
    }

    /**
     * Check localStorage for a previously selected language and re-apply translation
     */
    restoreSavedTranslation() {
      try {
        const savedLang = localStorage.getItem('blogLang');
        if (savedLang && savedLang !== this.originalLanguage) {
          console.log(`[Translation] Restoring saved language preference: ${savedLang}`);
          // Small delay to let the page fully render before translating
          setTimeout(() => {
            this.translatePage(savedLang);
          }, 800);
        } else if (savedLang === this.originalLanguage) {
          // Saved language matches current page language — clear stale preference
          localStorage.removeItem('blogLang');
        }
      } catch (e) {
        // localStorage may be unavailable
      }
    }

    /**
     * Set up dropdown, dynamic modals, and overlay structures in the DOM
     */
    setupUI() {
      // 1. Create the Onboarding Fallback Modal dynamically
      this.modalOverlay = document.createElement('div');
      this.modalOverlay.className = 'translation-modal-overlay';
      this.modalOverlay.innerHTML = `
        <div class="translation-modal-card">
          <div class="translation-modal-header">
            <h3 class="translation-modal-title"><i class="fa fa-globe"></i> Enable On-Device AI</h3>
            <button class="btn-modal-close" aria-label="Close modal">&times;</button>
          </div>
          <div class="translation-modal-body">
            <p>This personal blog integrates a cutting-edge, <strong>private on-device AI translation</strong> feature powered by Google Chrome's built-in Gemini Nano model!</p>
            <p>To experience local AI translations directly on your machine without sending data to cloud servers, please follow these steps:</p>
            <ul class="translation-step-list">
              <li>Open a new tab and go to: <span class="translation-flag-code">chrome://flags/#translation-api</span></li>
              <li>Set the <strong>Translation API</strong> flag to <strong>Enabled</strong>.</li>
              <li>Relaunch Google Chrome to apply the changes.</li>
            </ul>
            <p><em>Note: This is currently supported in desktop versions of Google Chrome.</em></p>
          </div>
          <div class="translation-modal-footer">
            <button class="btn-modal-primary btn-modal-dismiss">Got It</button>
          </div>
        </div>
      `;
      document.body.appendChild(this.modalOverlay);

      // 2. Create the Translation Status Banner dynamically
      this.statusBanner = document.createElement('div');
      this.statusBanner.id = 'translationStatus';
      this.statusBanner.className = 'translation-status-banner hidden';
      this.statusBanner.innerHTML = `
        <div class="translation-status-content">
          <div class="translation-status-info">
            <i class="fa fa-refresh fa-spin"></i>
            <span class="translation-status-text">Preparing translation...</span>
          </div>
          <div class="translation-status-actions">
            <button class="btn-translation-action secondary btn-restore">Show Original</button>
            <button class="btn-translation-action close-banner" aria-label="Close status"><i class="fa fa-times"></i></button>
          </div>
        </div>
        <div class="translation-progress-bar"><div class="translation-progress-inner"></div></div>
      `;

      // Prepend to post container if present
      const container = document.querySelector('.post-container');
      if (container) {
        container.insertBefore(this.statusBanner, container.firstChild);
      }
    }

    bindEvents() {
      // Toggle translation dropdown manually (Bootstrap JS not loaded on all pages)
      const toggleBtn = document.getElementById('translationToggle');
      const dropdownMenu = document.querySelector('.translation-menu.dropdown-menu');
      const dropdownParent = toggleBtn ? toggleBtn.closest('.dropdown') : null;

      if (toggleBtn && dropdownParent) {
        toggleBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          dropdownParent.classList.toggle('open');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
          if (!dropdownParent.contains(e.target)) {
            dropdownParent.classList.remove('open');
          }
        });

        // Close dropdown when a language is selected
        if (dropdownMenu) {
          dropdownMenu.addEventListener('click', (e) => {
            const link = e.target.closest('a[data-lang]');
            if (link) {
              dropdownParent.classList.remove('open');
            }
          });
        }
      }

      // Dropdown link events
      const links = document.querySelectorAll('.translation-menu li > a[data-lang]');
      links.forEach(link => {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          const targetLang = link.getAttribute('data-lang');
          this.translatePage(targetLang);
        });
      });

      // Restore Original buttons (both in banner and in menu)
      const restoreBtn = document.getElementById('restoreOriginal');
      if (restoreBtn) {
        restoreBtn.addEventListener('click', (e) => {
          e.preventDefault();
          this.restoreOriginalText();
        });
      }

      const bannerRestore = this.statusBanner.querySelector('.btn-restore');
      if (bannerRestore) {
        bannerRestore.addEventListener('click', (e) => {
          e.preventDefault();
          this.restoreOriginalText();
        });
      }

      // Close modal events
      const modalClose = this.modalOverlay.querySelector('.btn-modal-close');
      const modalDismiss = this.modalOverlay.querySelector('.btn-modal-dismiss');
      [modalClose, modalDismiss].forEach(btn => {
        if (btn) {
          btn.addEventListener('click', () => {
            this.modalOverlay.classList.remove('active');
          });
        }
      });

      // Dismiss status banner
      const bannerClose = this.statusBanner.querySelector('.close-banner');
      if (bannerClose) {
        bannerClose.addEventListener('click', () => {
          this.statusBanner.classList.add('hidden');
        });
      }
    }

    /**
     * Show/hide onboarding modal
     */
    showOnboarding() {
      this.modalOverlay.classList.add('active');
    }

    /**
     * Show visual translation status
     */
    showStatus(text, progress = null, isSpinner = true) {
      this.statusBanner.classList.remove('hidden');
      const textEl = this.statusBanner.querySelector('.translation-status-text');
      const iconEl = this.statusBanner.querySelector('.translation-status-info i');
      const progressInner = this.statusBanner.querySelector('.translation-progress-inner');
      const restoreBtn = this.statusBanner.querySelector('.btn-restore');

      textEl.textContent = text;
      
      // Update icons
      if (isSpinner) {
        iconEl.className = 'fa fa-refresh fa-spin';
      } else {
        iconEl.className = 'fa fa-check-circle';
      }

      // Update progress bar
      if (progress !== null) {
        progressInner.style.width = `${Math.min(100, Math.max(0, progress))}%`;
      } else {
        progressInner.style.width = '0%';
      }

      // Show restore action only when fully translated
      if (!this.isTranslating && this.currentLanguage !== this.originalLanguage) {
        restoreBtn.classList.remove('hidden');
      } else {
        restoreBtn.classList.add('hidden');
      }
    }

    /**
     * Caches and translates eligible text nodes inside .post-container
     */
    async translatePage(targetLang) {
      if (this.isTranslating) return;

      // 1. Check API Support
      if (!this.api) {
        this.showOnboarding();
        return;
      }

      const postContainer = document.querySelector('.post-container');
      if (!postContainer) {
        console.warn('No .post-container element found to translate.');
        return;
      }

      // Dynamically detect actual source language of content
      const detectedSourceLang = this.detectDOMLanguage(postContainer);
      console.log(`[Translation] Detected DOM source language: ${detectedSourceLang}, target: ${targetLang}`);

      if (targetLang === detectedSourceLang) {
        this.showStatus(`Content is already in ${LANGUAGES[targetLang] || targetLang}.`, 100, false);
        // Reset translation flag
        this.isTranslating = false;
        // Clear any stale language preference
        try { localStorage.removeItem('blogLang'); } catch (e) {}
        // Auto-hide the status banner after a delay if restoring/doing nothing
        setTimeout(() => {
          if (!this.isTranslating && this.currentLanguage === this.originalLanguage) {
            this.statusBanner.classList.add('hidden');
          }
        }, 3000);
        return;
      }

      if (targetLang === this.originalLanguage) {
        this.restoreOriginalText();
        return;
      }

      this.isTranslating = true;
      this.showStatus(`Detecting availability for translation to ${LANGUAGES[targetLang] || targetLang}...`, 5);

      const langPair = {
        sourceLanguage: detectedSourceLang,
        targetLanguage: targetLang
      };

      try {
        // Check availability with a timeout of 3.0 seconds
        let availability = 'no';
        try {
          console.log(`[Translation] Checking availability for:`, langPair);
          availability = await this.promiseWithTimeout(
            this.api.checkAvailability(langPair),
            3000,
            'Availability check timed out'
          );
          console.log(`[Translation] Availability result: ${availability}`);
        } catch (checkErr) {
          console.warn('[Translation] checkAvailability failed or timed out. Attempting direct creation fallback:', checkErr);
          // If checking availability times out or fails (common in experimental APIs), 
          // we attempt direct creation fallback by setting availability to 'available'.
          availability = 'available';
        }
        
        if (availability === 'no') {
          this.isTranslating = false;
          this.showStatus(`Translation model for ${LANGUAGES[targetLang] || targetLang} is not supported.`, 0, false);
          return;
        }

        let translator = this.translators.get(`${langPair.sourceLanguage}-${targetLang}`);

        if (!translator) {
          this.showStatus(`Downloading local translation model for ${LANGUAGES[targetLang]}... (0%)`, 10);

          try {
            console.log(`[Translation] Creating translator with params:`, langPair);
            // Create the translator with a timeout of 10 seconds
            translator = await this.promiseWithTimeout(
              this.api.create({
                ...langPair,
                monitor: (m) => {
                  m.addEventListener('downloadprogress', (e) => {
                    const percent = e.total ? Math.round((e.loaded / e.total) * 100) : Math.round(e.loaded * 100);
                    this.showStatus(`Downloading local translation model for ${LANGUAGES[targetLang]}... (${percent}%)`, 10 + (percent * 0.4));
                  });
                }
              }),
              10000,
              'Model initialization timed out'
            );
            console.log('[Translation] Translator created successfully');
          } catch (createErr) {
            console.error('[Translation] Failed to create translator:', createErr);
            this.isTranslating = false;
            this.showStatus(`Failed to initialize translation model for ${LANGUAGES[targetLang]}.`, 0, false);
            return;
          }

          this.translators.set(`${langPair.sourceLanguage}-${targetLang}`, translator);
        }

        this.showStatus('Analyzing post content...', 50);

        // Gather all eligible text nodes
        const textNodes = [];
        this.collectTextNodes(postContainer, textNodes);

        if (textNodes.length === 0) {
          this.isTranslating = false;
          this.showStatus('No translatable text content found in this post.', 100, false);
          return;
        }

        this.showStatus(`Translating post content... (0%)`, 60);

        // Translate nodes with concurrency control
        const CONCURRENCY = 5;
        let processed = 0;

        for (let i = 0; i < textNodes.length; i += CONCURRENCY) {
          const chunk = textNodes.slice(i, i + CONCURRENCY);
          await Promise.all(chunk.map(async (node) => {
            try {
              const original = node.__originalText.trim();
              if (original.length > 0) {
                const translated = await translator.translate(node.__originalText);
                node.textContent = this.preserveWhitespace(node.__originalText, translated);
              }
            } catch (err) {
              console.error('Text node translation failed:', err);
            }
          }));

          processed += chunk.length;
          const percent = Math.round((processed / textNodes.length) * 100);
          this.showStatus(`Translating post content... (${percent}%)`, 60 + (percent * 0.4));
        }

        // Translation Complete
        this.isTranslating = false;
        this.currentLanguage = targetLang;
        this.showStatus(`Translated to ${LANGUAGES[targetLang]} via on-device AI.`, 100, false);

        // Persist language preference across pages
        try {
          localStorage.setItem('blogLang', targetLang);
        } catch (e) {
          // localStorage may be unavailable
        }

        // Update Nav Menu UI states
        const restoreMenuBtn = document.getElementById('restoreOriginal');
        if (restoreMenuBtn) {
          restoreMenuBtn.classList.remove('disabled');
        }

      } catch (err) {
        console.error('Translation process error:', err);
        this.isTranslating = false;
        this.showStatus('Translation failed. Please check your browser setup.', 0, false);
      }
    }

    /**
     * Restore original text nodes
     */
    restoreOriginalText() {
      if (this.isTranslating) return;

      const postContainer = document.querySelector('.post-container');
      if (!postContainer) return;

      this.showStatus('Restoring original text...', 50);

      const textNodes = [];
      this.collectTextNodes(postContainer, textNodes);

      textNodes.forEach(node => {
        if (node.__originalText !== undefined) {
          node.textContent = node.__originalText;
        }
      });

      this.currentLanguage = this.originalLanguage;
      this.showStatus('Original language restored.', 100, false);

      // Clear persisted language preference
      try {
        localStorage.removeItem('blogLang');
      } catch (e) {
        // localStorage may be unavailable
      }
      
      // Auto-hide the status banner after a delay
      setTimeout(() => {
        if (this.currentLanguage === this.originalLanguage) {
          this.statusBanner.classList.add('hidden');
        }
      }, 3000);

      // Disable the Show Original menu item
      const restoreMenuBtn = document.getElementById('restoreOriginal');
      if (restoreMenuBtn) {
        restoreMenuBtn.classList.add('disabled');
      }
    }

    /**
     * Recursively traverses and collects translatable text nodes
     */
    collectTextNodes(element, list) {
      const EXCLUDE_TAGS = ['PRE', 'CODE', 'SCRIPT', 'STYLE', 'IFRAME', 'NOSCRIPT', 'TEXTAREA', 'INPUT', 'SELECT', 'BUTTON'];
      
      if (element.classList && (
          element.classList.contains('no-translate') || 
          element.classList.contains('katex') ||
          element.classList.contains('comment') ||
          element.classList.contains('ds-share') ||
          element.classList.contains('pager') ||
          element.id === 'translationStatus'
      )) {
        return; // skip excluded sections
      }

      for (let child = element.firstChild; child; child = child.nextSibling) {
        if (child.nodeType === Node.TEXT_NODE) {
          const content = child.textContent.trim();
          // Skip if empty or purely symbols
          if (content.length > 0 && /[a-zA-Z0-9\u4e00-\u9fa5\u3040-\u309f\u30a0-\u30ff]/.test(content)) {
            // Backup the text node's original value
            if (child.__originalText === undefined) {
              child.__originalText = child.textContent;
            }
            list.push(child);
          }
        } else if (child.nodeType === Node.ELEMENT_NODE) {
          if (!EXCLUDE_TAGS.includes(child.tagName)) {
            this.collectTextNodes(child, list);
          }
        }
      }
    }

    /**
     * Ensure surrounding whitespace is preserved for perfect markup integration
     */
    preserveWhitespace(original, translated) {
      const startMatch = original.match(/^\s*/);
      const endMatch = original.match(/\s*$/);
      const start = startMatch ? startMatch[0] : '';
      const end = endMatch ? endMatch[0] : '';
      return start + translated.trim() + end;
    }
  }

  // Instantiate the translation engine
  window.blogTranslator = new BlogTranslator();
})();
