document.addEventListener('DOMContentLoaded', () => {
    // --- Initial Icon Rendering ---
    feather.replace();

    // --- 1. Element Selection ---
    const inputErrorMessage = document.getElementById('input-error-message');
    const confirmationModal = document.getElementById('confirmation-modal');
    const modalConfirmBtn = document.getElementById('modal-confirm-btn');
    const modalCancelBtn = document.getElementById('modal-cancel-btn');
    const navLinks = document.querySelectorAll('.nav-link');
    const pages = document.querySelectorAll('.page');
    const dreamInput = document.getElementById('dream-input');
    const interpretButton = document.getElementById('interpret-button');
    const startNewBtn = document.getElementById('start-new-btn');
    const resultsContainer = document.getElementById('results-container');
    const interpretationOutput = document.getElementById('interpretation-output');
    const moodPaletteOutput = document.getElementById('mood-palette-output');
    const keySymbolsOutput = document.getElementById('key-symbols-output');
    const dreamLogList = document.getElementById('dream-log-list');
    const loader = document.getElementById('loader');
    const loaderText = document.getElementById('loader-text');
    const buttonText = document.getElementById('button-text');
    const actionButtonsContainer = document.querySelector('.action-buttons-container');
    const tooltip = document.getElementById('tooltip');
    
    // Feedback Elements
    const feedbackContainer = document.getElementById('feedback-container');
    const feedbackStep1 = document.getElementById('feedback-step-1');
    const feedbackYesBtn = document.getElementById('feedback-yes-btn');
    const feedbackNoBtn = document.getElementById('feedback-no-btn');
    const feedbackStep2Yes = document.getElementById('feedback-step-2-yes');
    const feedbackStep2No = document.getElementById('feedback-step-2-no');
    const starRatingContainer = document.querySelector('.star-rating');
    const feedbackChoiceBtns = document.querySelectorAll('.feedback-choice-btn');
    const feedbackThanks = document.getElementById('feedback-thanks');
    const feedbackLogContainer = document.getElementById('feedback-log-container');

    // --- 2. Application State ---
    let currentAnalysisResult = null;
    let isCurrentDreamSaved = false;
    let feedbackData = null;
    
    // --- 3. Navigation & Core Logic ---
    function setPlaceholderText() {
        const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
        const shortcutKey = isMac ? 'Cmd' : 'Ctrl';
        dreamInput.placeholder = `e.g., I dreamt my teeth were falling out...\n(${shortcutKey}+Enter to submit)`;
    }
    setPlaceholderText();
    document.title = 'Interpreter | AI Dream Interpreter';

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const pageId = link.getAttribute('data-page');
            navLinks.forEach(navLink => navLink.classList.remove('active'));
            pages.forEach(page => page.classList.remove('active'));
            link.classList.add('active');
            document.getElementById(pageId).classList.add('active');
	    document.title = `${link.textContent} | AI Dream Interpreter`;
            setTimeout(() => feather.replace(), 0);
        });
    });

    // --- 4. Mock AI & Display Logic ---
    function getMockInterpretation(dreamText) {
        const lowerCaseText = dreamText.toLowerCase();
        const mockData = {
            flying: {
                interpretation: "Flying in dreams often symbolizes a sense of freedom, release from daily pressures, and embracing personal power. It can indicate that you feel on top of the world or have gained a new, higher perspective on a situation in your life.",
                mood: "Freedom",
                moodColors: ['#87CEEB', '#E0FFFF', '#B0E0E6'],
                symbols: [{ emoji: '✈️', name: 'Flying', explanation: 'Represents freedom and personal power.' }, { emoji: '🏙️', name: 'Perspective', explanation: 'Symbolizes seeing things from a broader viewpoint.' }]
            },
            chasing: {
                interpretation: "Being chased in a dream typically points to avoidance of a situation or emotion in your waking life. Consider what you are running from. A dark forest can symbolize confusion, the unknown, or feeling lost on your current path.",
                mood: "Anxious",
                moodColors: ['#696969', '#A9A9A9', '#D3D3D3'],
                symbols: [{ emoji: '🏃‍♂️', name: 'Chasing', explanation: 'Indicates avoidance or anxiety.' }, { emoji: '🌲', name: 'Forest', explanation: 'Represents the unknown or feeling lost.' }]
            },
            water: {
                interpretation: "Dreams about water often reflect your emotional state and the unconscious mind. A calm ocean can signify peace and tranquility, while discovering a hidden treasure suggests newfound self-worth or uncovering a hidden talent.",
                mood: "Calm",
                moodColors: ['#4682B4', '#5F9EA0', '#ADD8E6'],
                symbols: [{ emoji: '🌊', name: 'Water', explanation: 'Reflects your current emotional state.' }, { emoji: '💎', name: 'Treasure', explanation: 'Suggests hidden talents or self-worth.' }]
            },
            teeth: {
                interpretation: "Dreams about teeth falling out are very common and often relate to stress, anxiety, and feelings of powerlessness or lack of control in a situation. It can also be linked to concerns about one's appearance or communication.",
                mood: "Insecure",
                moodColors: ['#E74C3C', '#F5B7B1', '#D98880'],
                symbols: [{ emoji: '🦷', name: 'Teeth Loss', explanation: 'Represents anxiety or loss of control.' }, { emoji: '💬', name: 'Communication', explanation: 'Symbolizes worries about how you are perceived.' }]
            },
            test: {
                interpretation: "Dreaming of taking a test, especially one you are unprepared for, often symbolizes being judged or scrutinized in your waking life. It can reflect a fear of failure or not living up to the expectations of others or yourself.",
                mood: "Anxious",
                moodColors: ['#696969', '#A9A9A9', '#D3D3D3'],
                symbols: [{ emoji: '📝', name: 'Test-taking', explanation: 'Indicates a fear of failure or being judged.' }, { emoji: '🏫', name: 'School', explanation: 'Represents conformance and expectations.' }]
            },
            money: {
                interpretation: "Finding money in a dream is often a positive omen, symbolizing self-worth, opportunity, and success. It can suggest that you are beginning to recognize your own value and the power you hold to shape your own life.",
                mood: "Optimistic",
                moodColors: ['#F1C40F', '#F7DC6F', '#FDEBD0'],
                symbols: [{ emoji: '💰', name: 'Finding Money', explanation: 'Symbolizes self-worth and new opportunities.' }, { emoji: '🌟', name: 'Success', explanation: 'Represents achievement and potential.' }]
            },
            default: {
                interpretation: "We couldn't identify a specific dream theme from your input. Please try to be more descriptive. For this prototype, supported themes include 'flying', 'chasing', 'water', 'teeth falling out', 'taking a test', and 'finding money'.",
                mood: "Mysterious",
                moodColors: ['#9370DB', '#8A2BE2', '#4B0082'],
                symbols: [{ emoji: '❓', name: 'Unknown', explanation: 'The dream theme was not recognized.' }]
            }
        };

        if (lowerCaseText.includes('fly')) return mockData.flying;
        if (lowerCaseText.includes('chase') || lowerCaseText.includes('running')) return mockData.chasing;
        if (lowerCaseText.includes('water') || lowerCaseText.includes('ocean')) return mockData.water;
        if (lowerCaseText.includes('teeth')) return mockData.teeth;
        if (lowerCaseText.includes('test') || lowerCaseText.includes('exam')) return mockData.test;
        if (lowerCaseText.includes('money') || lowerCaseText.includes('cash')) return mockData.money;
        return mockData.default;
    }

    function displayResults(data) {
        currentAnalysisResult = data;
	interpretButton.disabled = true;
        isCurrentDreamSaved = false;
        feedbackData = null;

        interpretationOutput.innerHTML = `<p>${data.interpretation}</p>`;
        
        moodPaletteOutput.innerHTML = '';
        if (data.mood === "Mysterious") {
            moodPaletteOutput.innerHTML = `<p class="error-text">N/A - Theme not recognized.</p>`;
        } else {
            const colorsContainer = document.createElement('div');
            colorsContainer.className = 'mood-colors-container';
            data.moodColors.forEach(color => {
                const colorDiv = document.createElement('div');
                colorDiv.className = 'mood-color-circle';
                colorDiv.style.backgroundColor = color;
                colorDiv.dataset.tooltip = `This color represents a mood of: ${data.mood}`;
                colorsContainer.appendChild(colorDiv);
            });
            moodPaletteOutput.appendChild(colorsContainer);
            const moodText = document.createElement('p');
            moodText.innerHTML = `This dream appears to have a <strong>${data.mood}</strong> mood.`;
            moodPaletteOutput.appendChild(moodText);
        }
        
        const symbolList = document.createElement('ul');
        data.symbols.forEach(symbol => {
            const listItem = document.createElement('li');
            listItem.innerHTML = `<strong style="color: var(--text-primary);">${symbol.emoji} ${symbol.name}</strong>`;
            listItem.dataset.tooltip = symbol.explanation;
            symbolList.appendChild(listItem);
        });
        keySymbolsOutput.innerHTML = '';
        keySymbolsOutput.appendChild(symbolList);

        resetFeedbackUI();
        resultsContainer.classList.add('visible');
        addDynamicActionButtons();
	startNewBtn.classList.add('visible');
	feather.replace();
    }

    // --- 5. UI Update & Interaction Functions ---
    function showLoader(isLoading, text) {
        if (isLoading) {
	    interpretButton.disabled = true;
            buttonText.style.display = 'none';
            loader.style.display = 'flex';
            loaderText.textContent = text;
        } else {
            buttonText.style.display = 'block';
            loader.style.display = 'none';
        }
    }
    
    function addDynamicActionButtons() {
        actionButtonsContainer.innerHTML = `
            <button id="copy-btn" data-tooltip="Copy interpretation text"><i data-feather="copy"></i><span>Copy</span></button>
            <button id="save-btn" data-tooltip="Save this interpretation to the Dream Log"><i data-feather="save"></i><span>Save to Log</span></button>
        `;
        feather.replace();
        document.getElementById('copy-btn').addEventListener('click', copyInterpretation);
        document.getElementById('save-btn').addEventListener('click', saveCurrentDream);
    }
    
    function copyInterpretation() {
        const btn = document.getElementById('copy-btn');
        navigator.clipboard.writeText(currentAnalysisResult.interpretation);
        btn.innerHTML = `<i data-feather="check"></i><span>Copied!</span>`;
        btn.style.color = 'var(--success-color)';
        feather.replace();
        setTimeout(() => {
            btn.innerHTML = `<i data-feather="copy"></i><span>Copy</span>`;
            btn.style.color = 'inherit';
            feather.replace();
        }, 2000);
    }

    function saveCurrentDream() {
        if (!currentAnalysisResult || isCurrentDreamSaved) return;
        const saveBtn = document.getElementById('save-btn');
        const logPlaceholder = document.querySelector('.log-placeholder');
        if (logPlaceholder) logPlaceholder.remove();
        
        const fullDreamText = dreamInput.value.trim();
        const interpretationText = currentAnalysisResult.interpretation;
        
        const listItem = document.createElement('li');
        const logId = `log-${Date.now()}`;
        listItem.id = logId;
        currentAnalysisResult.logId = logId;
        
        const feedbackText = feedbackData ? `<span class="log-feedback">[Feedback: ${feedbackData.type === 'rating' ? `${feedbackData.value} Stars` : `Improve ${feedbackData.value}`}]</span>` : '';
        
        listItem.innerHTML = `
            <div class="log-content">
                <p><strong>Dream:</strong></p><p>${fullDreamText}</p>
                <p><strong>Interpretation:</strong></p><p>${interpretationText}</p>
                <p><strong>Mood:</strong> ${currentAnalysisResult.mood}</p>
                <div class="log-feedback-container">${feedbackText}</div>
            </div>
            <button class="delete-log-btn" data-tooltip="Delete Log Entry"><i data-feather="trash-2"></i><span>Delete</span></button>
        `;
        dreamLogList.prepend(listItem);
        feather.replace();
        isCurrentDreamSaved = true;

        saveBtn.innerHTML = `<i data-feather="check-circle"></i><span>Saved!</span>`;
        saveBtn.disabled = true;
        saveBtn.dataset.tooltip = 'This dream has already been saved.';
        feather.replace();
    }

    function clearInterpreter() {
        if (currentAnalysisResult && !isCurrentDreamSaved) {
            if (!confirm("Are you sure? Your current interpretation hasn't been saved and will be lost.")) {
                return;
            }
        }
        resultsContainer.classList.add('clearing');
        resultsContainer.addEventListener('transitionend', () => {
            if (resultsContainer.classList.contains('clearing')) {
                dreamInput.value = '';
                actionButtonsContainer.innerHTML = '';
                currentAnalysisResult = null;
                isCurrentDreamSaved = false;
                resultsContainer.classList.remove('visible', 'clearing');
		interpretButton.disabled = false;
                startNewBtn.classList.remove('visible');
            }
        }, { once: true });
    }

    function resetFeedbackUI() {
        feedbackStep1.style.display = 'block';
        feedbackStep2Yes.style.display = 'none';
        feedbackStep2No.style.display = 'none';
        feedbackThanks.style.opacity = '0';
        setTimeout(() => { feedbackThanks.innerHTML = ''; }, 300);
        
        const currentStars = starRatingContainer.querySelectorAll('.star');
        currentStars.forEach(s => s.classList.remove('filled'));
        
        feedbackLogContainer.innerHTML = '';
        feather.replace();
    }

    function submitFeedback(type, value) {
        feedbackData = { type, value };
        
        feedbackThanks.innerHTML = `<span>Thank you! Your feedback has been recorded.</span> <button id="feedback-undo-btn"><i data-feather="rotate-ccw"></i> Undo</button>`;
        document.getElementById('feedback-undo-btn').onclick = undoFeedback;
        feather.replace();
        
        feedbackThanks.style.opacity = '1';
        
        feedbackStep1.style.display = 'none';
        feedbackStep2Yes.style.display = 'none';
        feedbackStep2No.style.display = 'none';

        updateFeedbackLog();
    }
    
    function undoFeedback() {
        feedbackData = null;
        resetFeedbackUI();
        updateFeedbackLog();
    }

    function updateFeedbackLog() {
        const logItem = document.createElement('div');
        logItem.className = 'feedback-log-item';
        const timestamp = new Date().toLocaleTimeString();

        if (feedbackData) {
            let feedbackMessage = feedbackData.type === 'rating' ? `Rated ${feedbackData.value} Stars` : `Suggestion: Improve ${feedbackData.value}`;
            logItem.innerHTML = `<i data-feather="check-circle"></i> <div>Feedback submitted at ${timestamp} (${feedbackMessage})</div>`;
        }
        
        feedbackLogContainer.innerHTML = '';
        if (feedbackData) {
            feedbackLogContainer.appendChild(logItem);
        }
        feather.replace();

        if (isCurrentDreamSaved) {
            const logEntry = document.getElementById(currentAnalysisResult.logId);
            if(logEntry) {
                const feedbackDiv = logEntry.querySelector('.log-feedback-container');
                const feedbackText = feedbackData ? `<span class="log-feedback">[Feedback: ${feedbackData.type === 'rating' ? `${feedbackData.value} Stars` : `Improve ${feedbackData.value}`}]</span>` : '';
                feedbackDiv.innerHTML = feedbackText;
            }
        }
    }
    
    // --- 6. Tooltip Logic ---
    function showTooltip(e) {
        const targetElement = e.target.closest('[data-tooltip]');
        if (!targetElement) return;
        
        const tooltipText = targetElement.dataset.tooltip;
        if (!tooltipText) return;
        
        tooltip.textContent = tooltipText;
        tooltip.style.opacity = '1';

        // THIS IS THE FIX: Use pageX and pageY which account for scroll position
        const posX = e.pageX;
        const posY = e.pageY;
        
        tooltip.style.left = `${posX - tooltip.offsetWidth / 2}px`;
        tooltip.style.top = `${posY - tooltip.offsetHeight - 15}px`;
    }

    function hideTooltip() {
        tooltip.style.opacity = '0';
    }

    function runInterpretation() {
    const dreamText = dreamInput.value.trim();
    if (dreamText === '') return;
    const dynamicDelay = Math.min(1000, 200 + dreamText.length * 2);
        showLoader(true, `Interpreting...`);
        setTimeout(() => {
            displayResults(getMockInterpretation(dreamText));
            showLoader(false);
        }, dynamicDelay);
    }

    // --- 7. Event Listeners ---
    dreamInput.addEventListener('keydown', (e) => {
        const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
        const shortcutPressed = isMac ? (e.metaKey && e.key === 'Enter') : (e.ctrlKey && e.key === 'Enter');
        if (shortcutPressed) {
            e.preventDefault();
            interpretButton.click();
        }
    });

    interpretButton.addEventListener('click', () => {
        const dreamText = dreamInput.value.trim();
        if (dreamText === '') {
	    dreamInput.classList.add('error');
            inputErrorMessage.textContent = 'Please describe your dream before interpreting.';
	    inputErrorMessage.classList.add('visible');
            return;
        }
        if (currentAnalysisResult) {
            confirmationModal.classList.add('visible');
	} else {
	    runInterpretation();
        }
    });

    startNewBtn.addEventListener('click', () => {
        clearInterpreter();
    });

    modalConfirmBtn.addEventListener('click', () => {
        confirmationModal.classList.remove('visible');
        runInterpretation(); 
    });

    modalCancelBtn.addEventListener('click', () => {
        confirmationModal.classList.remove('visible'); 
    });
    
    dreamInput.addEventListener('input', () => {
	if (dreamInput.classList.contains('error')) {
            dreamInput.classList.remove('error');
            inputErrorMessage.classList.remove('visible');
    	}
	if (interpretButton.disabled) {
            interpretButton.disabled = false;
        }
    });

    dreamLogList.addEventListener('click', e => {
        const deleteButton = e.target.closest('.delete-log-btn');
        if (deleteButton) {
            const listItem = deleteButton.closest('li');
            listItem.classList.add('removing');
            listItem.addEventListener('transitionend', () => {
                listItem.remove();
                if (dreamLogList.children.length === 0) {
                     dreamLogList.innerHTML = '<li class="log-placeholder">Your saved dreams will appear here.</li>';
                }
            });
        }
    });
    
    feedbackYesBtn.addEventListener('click', () => {
        feedbackStep1.style.display = 'none';
        feedbackStep2Yes.style.display = 'block';
        feather.replace();
    });

    feedbackNoBtn.addEventListener('click', () => {
        feedbackStep1.style.display = 'none';
        feedbackStep2No.style.display = 'block';
    });
    
    starRatingContainer.addEventListener('click', e => {
        const clickedStarSpan = e.target.closest('.star');
        
        if (clickedStarSpan && !feedbackData) {
            const rating = parseInt(clickedStarSpan.dataset.value, 10);
            
            const liveStars = starRatingContainer.querySelectorAll('.star');
            liveStars.forEach((star, index) => {
                star.classList.toggle('filled', index < rating);
            });
            
            submitFeedback('rating', rating);
        }
    });

    feedbackChoiceBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (!feedbackData) {
                const choice = btn.dataset.feedback;
                submitFeedback('choice', choice);
            }
        });
    });
    
    // Use event delegation on the body for tooltips for performance
    document.body.addEventListener('mouseover', e => {
        if (e.target.closest('[data-tooltip]')) {
            showTooltip(e);
        }
    });
    document.body.addEventListener('mouseout', e => {
        if (e.target.closest('[data-tooltip]')) {
            hideTooltip();
        }
    });
    document.body.addEventListener('mousemove', e => {
         if (tooltip.style.opacity === '1' && e.target.closest('[data-tooltip]')) {
             // THIS IS THE FIX: Use pageX and pageY which account for scroll position
            const posX = e.pageX;
            const posY = e.pageY;
            tooltip.style.left = `${posX - tooltip.offsetWidth / 2}px`;
            tooltip.style.top = `${posY - tooltip.offsetHeight - 15}px`;
         }
    });
});