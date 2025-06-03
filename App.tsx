
import React, { useState, useEffect, useCallback, useRef } from 'react';
import GameBoard from './components/GameBoard';
import BallCell from './components/BallCell'; // For previews
import { BoardState, CellState, BallColor, SelectedBallEntity, Position, Ball, HighScoreEntry, BallStyle } from './types';
import { 
  BOARD_ROWS, BOARD_COLS, BALL_COLORS, MIN_MATCH_LENGTH, 
  MAX_HIGH_SCORES, TOP_SCORES_TO_DISPLAY, 
  SMARTPHONE_CELL_SIZE_PX, 
  DISSOLVE_ANIMATION_DURATION_MS,
  COLOR_BOMB_SPAWN_CHANCE, COLOR_BOMB_EFFECT_POINTS_PER_BALL,
  // LOCAL_STORAGE_KEY // No longer used here for high scores
} from './constants';

const GAME_DURATION_SECONDS = 60;
const DEFAULT_FONT_FAMILY = "'Share Tech Mono', monospace";
const NINTENDO_FONT_FAMILY = "'Press Start 2P', cursive";
const POLITYK_FONT_FAMILY = "'Merriweather', serif";

const generateRandomBall = (): Ball => {
  const color = BALL_COLORS[Math.floor(Math.random() * BALL_COLORS.length)];
  const isColorBomb = Math.random() < COLOR_BOMB_SPAWN_CHANCE;
  return { 
    id: crypto.randomUUID(), 
    color,
    ...(isColorBomb && { powerUpType: 'colorBomb' })
  };
};

const MUSIC_TRACKS = [
  { path: '/sounds/music-track-1.mp3', nameKey: 'music_track_1_name' },
  { path: '/sounds/music-track-2.mp3', nameKey: 'music_track_2_name' },
  { path: '/sounds/music-track-3.mp3', nameKey: 'music_track_3_name' },
  { path: '/sounds/music-track-4.mp3', nameKey: 'music_track_4_name' },
  { path: '/sounds/music-track-5.mp3', nameKey: 'music_track_5_name' },
  { path: '/sounds/music-track-6.mp3', nameKey: 'music_track_6_name' },
  { path: '/sounds/music-track-7.mp3', nameKey: 'music_track_7_name' },
  { path: '/sounds/music-track-8.mp3', nameKey: 'music_track_8_name' },
];

type Language = 'en' | 'pl';
type GridSizeOption = 'smartphone' | 'medium' | 'large';

const allTranslations = {
  selectLanguageTitle: { en: "Select Language", pl: "Wybierz Język" },
  languagePolish: { en: "Polski", pl: "Polski" },
  languageEnglish: { en: "English", pl: "English" },
  welcome_title: { en: "Color Connect", pl: "Color Connect" },
  welcome_brief_intro: { en: "Connect colorful balls, score points, and beat the clock!", pl: "Łącz kolorowe kulki, zdobywaj punkty i pokonaj czas!" },
  welcome_instructions_button_text: { en: "How to Play", pl: "Jak Grać?" },
  welcome_options_button_text: { en: "Options", pl: "Opcje" }, 
  welcome_full_leaderboard_button_text: { en: "Full Leaderboard", pl: "Pełna Tablica Wyników"},
  welcome_top_scores_title: { en: `Top ${TOP_SCORES_TO_DISPLAY} Scores`, pl: `Top ${TOP_SCORES_TO_DISPLAY} Wyniki` },
  welcome_score_label: { en: "Score", pl: "Wynik" }, 
  welcome_date_label: { en: "Date", pl: "Data" }, 
  welcome_no_high_scores: { en: "No high scores yet. Be the first!", pl: "Brak najlepszych wyników. Bądź pierwszy!" },
  welcome_start_button_text: { en: "Start Game", pl: "Rozpocznij Grę" },
  welcome_start_button_aria: { en: "Start Game", pl: "Rozpocznij Grę" },
  welcome_footer_built_with: { en: "Built with Gemini", pl: "Stworzone z Gemini" },
  instructions_page_title: { en: "Game Instructions", pl: "Instrukcja Gry" },
  instructions_back_button_text: { en: "Back to Welcome", pl: "Wróć do Powitania" },
  welcome_instructions_p1: { en: `Connect ${MIN_MATCH_LENGTH} or more balls of the same color, horizontally or vertically.`, pl: `Połącz ${MIN_MATCH_LENGTH} lub więcej kulek tego samego koloru, poziomo lub pionowo.` },
  welcome_instructions_p2: { en: `You have ${GAME_DURATION_SECONDS / 60} minute to score as high as you can!`, pl: `Masz ${GAME_DURATION_SECONDS / 60} minutę, aby zdobyć jak najwięcej punktów!` },
  welcome_time_bonus_info: { en: "Connecting longer chains grants time bonuses: 4 balls = +2s, 5 = +4s, 6 = +6s, 7 = +8s, 8 = +10s, >8 = +12s.", pl: "Dłuższe łańcuchy dają bonusy czasowe: 4 kulki = +2s, 5 = +4s, 6 = +6s, 7 = +8s, 8 = +10s, >8 = +12s." },
  welcome_scoring_info: { en: "Points are awarded using the formula: (number of connected balls)² × 10.", pl: "Punkty są przyznawane według wzoru: (liczba połączonych kulek)² × 10." },
  welcome_scoring_example: { en: "For example, connecting 3 balls gives 3×3×10 = 90 points.", pl: "Na przykład, połączenie 3 kulek daje 3×3×10 = 90 punktów." },
  welcome_powerup_color_bomb_title: { en: "Power-up: Color Bomb!", pl: "Ulepszenie: Bomba Kolorowa!" },
  welcome_powerup_color_bomb_desc: { en: "A special ball with a pulsating ring. If included in a match, it clears ALL other balls of ITS color from the board! Extra balls cleared by the bomb give bonus points.", pl: "Specjalna kulka z pulsującym pierścieniem. Jeśli jest częścią dopasowania, usuwa WSZYSTKIE inne kulki JEJ koloru z planszy! Dodatkowe kulki usunięte przez bombę dają punkty bonusowe." },
  options_main_title: { en: "Options", pl: "Opcje" },
  options_music_button_text: { en: "Music Options", pl: "Opcje Muzyki" },
  options_graphics_button_text: { en: "Ball Styles", pl: "STANDARDOWE STYLE KULEK" },
  options_grid_size_button_text: { en: "Grid & Ball Size", pl: "Rozmiar Siatki i Kulek"},
  options_back_button_text: { en: "Back to Welcome", pl: "Wróć do Powitania" }, 
  graphics_options_custom_styles_button_text: { en: "Custom Styles", pl: "NIESTANDARDOWE STYLE KULEK" }, 
  music_options_page_title: { en: "Music Options", pl: "Opcje Muzyki" },
  options_volume_label: { en: "Volume", pl: "Głośność" },
  options_volume_aria_label: { en: "Music volume slider", pl: "Suwak głośności muzyki"},
  options_back_to_main_options_button_text: { en: "Back to Options", pl: "Wróć do Opcji" }, 
  music_track_1_name: { en: "Chill Vibes", pl: "Relaksujące Wibracje" },
  music_track_2_name: { en: "Upbeat Energy", pl: "Energiczny Rytm" },
  music_track_3_name: { en: "Focused Flow", pl: "Skupiony Przepływ" },
  music_track_4_name: { en: "Arcade Classic", pl: "Spokój i miłość" },
  music_track_5_name: { en: "Synth Dreams", pl: "Syntezatorowe Sny" },
  music_track_6_name: { en: "Retro Future", pl: "Retro Przyszłość" },
  music_track_7_name: { en: "Lo-Fi Beats", pl: "Lo-Fi Bity" },
  music_track_8_name: { en: "Action Pulse", pl: "Puls Relaksu" },
  graphics_options_page_title: { en: "Ball Styles", pl: "Style Kulek" }, 
  graphics_options_ball_style_label: { en: "Ball Style", pl: "Styl Kulek" },
  graphics_options_style_default: { en: "Default Balls", pl: "Domyślne Kulki" },
  graphics_options_style_heart: { en: "Hearts", pl: "Serca" },
  graphics_options_style_gemstone: { en: "Gemstones", pl: "Klejnoty" },
  graphics_options_style_square: { en: "Minimalist Squares", pl: "Minimalistyczne Kwadraty" },
  graphics_options_style_custom_png: { en: "Custom PNG Images", pl: "Własne Grafiki PNG" },
  graphics_options_preview_label: { en: "Preview:", pl: "Podgląd:" },
  custom_styles_page_title: { en: "Custom Styles", pl: "Niestandardowe Style" },
  graphics_options_style_nintendo_png: { en: "Nintendo PNG Style", pl: "Styl Nintendo PNG" },
  graphics_options_style_polityk_png: { en: "Politician PNG Style", pl: "Styl Polityk PNG" },
  grid_size_options_page_title: { en: "Grid & Ball Size", pl: "Rozmiar Siatki i Kulek" },
  grid_size_option_smartphone_label: { en: "Smartphone Size", pl: "Rozmiar pod Smartfon" },
  grid_size_option_smartphone_desc: { en: "Optimized for smaller screens (60px cells).", pl: "Zoptymalizowany dla mniejszych ekranów (komórki 60px)." },
  grid_size_option_medium_label: { en: "Medium Size", pl: "Rozmiar Średni" },
  grid_size_option_medium_desc: { en: "Larger elements for better visibility (75px cells).", pl: "Większe elementy dla lepszej widoczności (komórki 75px)." },
  grid_size_option_large_label: { en: "Large Size", pl: "Rozmiar Duży" },
  grid_size_option_large_desc: { en: "Maximum size for comfort on large screens (90px cells).", pl: "Maksymalny rozmiar dla komfortu na dużych ekranach (komórki 90px)." },
  full_leaderboard_page_title: { en: `Top ${MAX_HIGH_SCORES} High Scores`, pl: `Top ${MAX_HIGH_SCORES} Najlepszych Wyników` },
  game_header_title: { en: "Color Connect", pl: "Color Connect" },
  game_score_display_label: { en: "Score", pl: "Wynik" },
  game_time_display_label: { en: "Time", pl: "Czas" },
  game_rank_label: { en: "Rank:", pl: "Miejsce w rankingu:" },
  game_reset_button_text: { en: "Back to Menu", pl: "Powrót do menu" },
  game_reset_button_aria: { en: "Back to Menu", pl: "Powrót do Menu" },
  game_footer_instruction: { en: "Drag to connect balls. Horizontal or vertical lines.", pl: "Przeciągnij, aby połączyć kulki. Linie poziome lub pionowe." },
  gameover_title: { en: "Game Over", pl: "Koniec Gry" },
  gameover_times_up_message: { en: "Time's up!", pl: "Czas minął!" },
  gameover_no_moves_message: { en: "No more moves!", pl: "Brak ruchów!" },
  gameover_your_score_label: { en: "Your Score", pl: "Twój Wynik" },
  gameover_back_to_welcome_button_text: { en: "Back to Welcome Screen", pl: "Wróć do Ekranu Powitalnego" },
  gameover_back_to_welcome_button_aria: { en: "Play Again - Back to Welcome Screen", pl: "Zagraj Ponownie - Wróć do Ekranu Powitalnego" },
  highscore_new_title: { en: "New High Score!", pl: "Nowy Rekord!" },
  highscore_enter_name_label: { en: "Enter your name (max 15 chars):", pl: "Wpisz swoje imię (max 15 znaków):" },
  highscore_player_name_input_aria: { en: "Player name for high score", pl: "Imię gracza dla najlepszego wyniku" },
  highscore_submit_button_text: { en: "Submit Score", pl: "Zapisz Wynik" },
  highscore_submit_button_aria: { en: "Submit Score", pl: "Zapisz Wynik" },
  api_loading_scores: { en: "Loading scores...", pl: "Ładowanie wyników..." },
  api_error_load_scores: { en: "Error loading scores. Please try again later.", pl: "Błąd ładowania wyników. Spróbuj ponownie później." },
  api_error_submit_score: { en: "Error submitting score. Please try again.", pl: "Błąd zapisu wyniku. Spróbuj ponownie." },
};

const App: React.FC = () => {
  const [language, setLanguage] = useState<Language>('en');
  const [languageSelected, setLanguageSelected] = useState<boolean>(false);
  const [showInstructionsPage, setShowInstructionsPage] = useState<boolean>(false); 
  const [showOptionsPage, setShowOptionsPage] = useState<boolean>(false); 
  const [currentOptionsView, setCurrentOptionsView] = useState<'main' | 'music' | 'graphics' | 'graphics_custom' | 'grid_size'>('main');
  const [ballStyle, setBallStyle] = useState<BallStyle>('default');
  const [currentGridSizeOption, setCurrentGridSizeOption] = useState<GridSizeOption>('smartphone');
  const [showFullLeaderboardPage, setShowFullLeaderboardPage] = useState<boolean>(false);
  const [currentMusicPath, setCurrentMusicPath] = useState<string>(MUSIC_TRACKS[0].path); 
  const [musicVolume, setMusicVolume] = useState<number>(0.4); 

  const [gameBoardBackgroundUrl, setGameBoardBackgroundUrl] = useState<string | null>(null);
  
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(GAME_DURATION_SECONDS);

  const [highScores, setHighScores] = useState<HighScoreEntry[]>([]);
  const [playerName, setPlayerName] = useState<string>("");
  const [showNameInput, setShowNameInput] = useState<boolean>(false);
  const [currentPlayerRankDisplay, setCurrentPlayerRankDisplay] = useState<string | null>(null);

  const [gameAreaScale, setGameAreaScale] = useState<number>(1);

  // States for API communication
  const [isLoadingHighScores, setIsLoadingHighScores] = useState<boolean>(false);
  const [isSubmittingScore, setIsSubmittingScore] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);


  const gridElementRef = useRef<HTMLDivElement>(null);
  const lastHoveredCellRef = useRef<Position | null>(null);
  const countdownSoundRef = useRef<HTMLAudioElement | null>(null);
  const matchSoundRef = useRef<HTMLAudioElement | null>(null); 
  const backgroundMusicRef = useRef<HTMLAudioElement | null>(null);

  const [dissolvingBalls, setDissolvingBalls] = useState<Position[]>([]);
  const [isBoardUpdating, setIsBoardUpdating] = useState<boolean>(false);

  const { effectiveCellSize, effectiveHeartTextSizeClass, effectivePowerUpRingStyles, effectiveLineStrokeWidth, effectiveGameAreaTargetWidth } = React.useMemo(() => {
    let cellSize = SMARTPHONE_CELL_SIZE_PX;
    let heartText = 'text-4xl';
    let powerUpRing = { inset: 'inset-[-5px]', border: 'border-[3px]' };
    let lineStroke = "8";

    if (currentGridSizeOption === 'medium') {
      cellSize = 75;
      heartText = 'text-5xl';
      powerUpRing = { inset: 'inset-[-7px]', border: 'border-[4px]' };
      lineStroke = "10";
    } else if (currentGridSizeOption === 'large') {
      cellSize = 90;
      heartText = 'text-6xl';
      powerUpRing = { inset: 'inset-[-9px]', border: 'border-[5px]' };
      lineStroke = "12";
    }
    const gameAreaTarget = cellSize * BOARD_COLS + 16; 

    return {
      effectiveCellSize: cellSize,
      effectiveHeartTextSizeClass: heartText,
      effectivePowerUpRingStyles: powerUpRing,
      effectiveLineStrokeWidth: lineStroke,
      effectiveGameAreaTargetWidth: gameAreaTarget
    };
  }, [currentGridSizeOption]);

  const t = useCallback((key: keyof typeof allTranslations, replacements?: Record<string, string | number>): string => {
    const translationTemplate = allTranslations[key]?.[language];
    if (!translationTemplate) {
      console.warn(`Translation key "${String(key)}" not found for language "${language}"`);
      if (String(key) === 'game_header_instruction') return ""; 
      return String(key); 
    }
    if (replacements) {
      return Object.entries(replacements).reduce((acc, [placeholder, value]) => {
        return acc.replace(new RegExp(`{${placeholder}}`, 'g'), String(value));
      }, translationTemplate);
    }
    return translationTemplate;
  }, [language]);

  // Fetch high scores from server
  useEffect(() => {
    if (languageSelected) {
      const fetchScores = async () => {
        setIsLoadingHighScores(true);
        setApiError(null);
        try {
          const response = await fetch('/api/high-scores');
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Failed to parse error response from server' }));
            throw new Error(errorData.message || `Server error: ${response.status}`);
          }
          const data = await response.json();
          if (Array.isArray(data)) {
            setHighScores(data);
          } else {
            console.warn("Invalid high scores data from server:", data);
            setHighScores([]);
            throw new Error('Received invalid score data format from server.');
          }
        } catch (error) {
          console.error("Failed to load high scores from server:", error);
          setApiError(t('api_error_load_scores'));
          setHighScores([]); 
        } finally {
          setIsLoadingHighScores(false);
        }
      };
      fetchScores();
    }
  }, [languageSelected, t]);

  // useEffect for sounds (no changes here)
  useEffect(() => {
    if (!countdownSoundRef.current) {
      countdownSoundRef.current = new Audio('/sounds/countdown-tick.mp3');
      countdownSoundRef.current.volume = 1.0;
      countdownSoundRef.current.onerror = () => {
        console.warn("Could not load the countdown tick sound. Make sure 'countdown-tick.mp3' is in the 'public/sounds/' folder.");
      };
    }
    if (!matchSoundRef.current) {
      matchSoundRef.current = new Audio('/sounds/match-success.mp3');
      matchSoundRef.current.volume = 1.0; 
      matchSoundRef.current.onerror = () => {
        console.warn("Could not load the match success sound. Make sure 'match-success.mp3' is in the 'public/sounds/' folder.");
      };
    }
  }, []); 

  // useEffect for music (no changes here)
  useEffect(() => {
    if (!languageSelected) {
      if (backgroundMusicRef.current && !backgroundMusicRef.current.paused) {
        backgroundMusicRef.current.pause();
      }
      return;
    }
    let audio = backgroundMusicRef.current;
    let pathForAudioPlayback = currentMusicPath; 
    if (gameStarted && !isGameOver && ballStyle === 'nintendo_png') {
      pathForAudioPlayback = '/sounds/nintendo.mp3'; 
    } else if (gameStarted && !isGameOver && ballStyle === 'polityk_png') {
      pathForAudioPlayback = '/sounds/polityk.mp3';
    }
    const absoluteAudioURL = new URL(pathForAudioPlayback, window.location.origin).href;
    const playWhenReady = (audioElement: HTMLAudioElement) => {
      if (audioElement.paused && audioElement.readyState >= HTMLMediaElement.HAVE_ENOUGH_DATA) {
        audioElement.play().catch(error => {
          console.warn(`Music play attempt failed for ${audioElement.src}:`, error);
        });
      }
    };
    const handleCanPlayThrough = (event: Event) => {
      const audioElement = event.target as HTMLAudioElement;
      playWhenReady(audioElement);
    };
    const handleError = (event: Event) => {
        const audioElement = event.target as HTMLAudioElement;
        console.error(`Error loading music: ${audioElement.src}`, audioElement.error);
    };
    if (!audio) {
      audio = new Audio(absoluteAudioURL);
      audio.loop = true;
      audio.volume = musicVolume; 
      audio.addEventListener('canplaythrough', handleCanPlayThrough);
      audio.addEventListener('error', handleError);
      backgroundMusicRef.current = audio;
      playWhenReady(audio); 
    } else {
      audio.volume = musicVolume; 
      const currentAudioSrcNormalized = new URL(audio.src, window.location.origin).pathname;
      const desiredSrcNormalized = new URL(pathForAudioPlayback, window.location.origin).pathname;
      if (currentAudioSrcNormalized !== desiredSrcNormalized) {
        audio.removeEventListener('canplaythrough', handleCanPlayThrough);
        audio.removeEventListener('error', handleError);
        audio.pause();
        audio.src = absoluteAudioURL; 
        audio.volume = musicVolume; 
        audio.addEventListener('canplaythrough', handleCanPlayThrough);
        audio.addEventListener('error', handleError);
        audio.load(); 
        playWhenReady(audio); 
      } else {
         playWhenReady(audio); 
      }
    }
    return () => {
      if (audio) { 
        audio.removeEventListener('canplaythrough', handleCanPlayThrough);
        audio.removeEventListener('error', handleError);
      }
    };
  }, [languageSelected, currentMusicPath, musicVolume, gameStarted, ballStyle, isGameOver]);
  
  // useEffect for game area scaling (no changes here)
  useEffect(() => {
    const calculateScale = () => {
      if (!gameStarted) {
        setGameAreaScale(1); 
        return;
      }
      const screenWidth = window.innerWidth;
      if (screenWidth < effectiveGameAreaTargetWidth) {
        const newScale = screenWidth / effectiveGameAreaTargetWidth;
        setGameAreaScale(Math.min(1, newScale)); 
      } else {
        setGameAreaScale(1);
      }
    };
    calculateScale(); 
    window.addEventListener('resize', calculateScale);
    return () => window.removeEventListener('resize', calculateScale);
  }, [gameStarted, effectiveGameAreaTargetWidth]);

  // useEffect for body font (no changes here)
  useEffect(() => {
    if (gameStarted && !isGameOver) {
      if (ballStyle === 'nintendo_png') {
        document.body.style.fontFamily = NINTENDO_FONT_FAMILY;
      } else if (ballStyle === 'polityk_png') {
        document.body.style.fontFamily = POLITYK_FONT_FAMILY;
      } else {
        document.body.style.fontFamily = DEFAULT_FONT_FAMILY;
      }
    } else {
      document.body.style.fontFamily = DEFAULT_FONT_FAMILY;
    }
  }, [gameStarted, isGameOver, ballStyle]);

  // Submit high score to server
  const addHighScore = useCallback(async (name: string, currentScore: number) => {
    if (!name.trim() || currentScore <= 0) return false;
    
    setApiError(null);
    setIsSubmittingScore(true);

    const d = new Date();
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0'); 
    const year = d.getFullYear();
    const formattedDate = `${day}.${month}.${year}`;

    const newEntry: HighScoreEntry = {
      name: name.trim(),
      score: currentScore,
      date: formattedDate,
    };

    try {
      const response = await fetch('/api/high-scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEntry),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to parse error response from server' }));
        throw new Error(errorData.message || `Server error: ${response.status}`);
      }
      const updatedScores = await response.json();
      if (Array.isArray(updatedScores)) {
        setHighScores(updatedScores);
        return true; // Indicate success
      } else {
        console.warn("Invalid updated scores data from server:", updatedScores);
        throw new Error('Received invalid score data format after submission.');
      }
    } catch (error) {
      console.error("Failed to submit high score:", error);
      setApiError(t('api_error_submit_score'));
      return false; // Indicate failure
    } finally {
      setIsSubmittingScore(false);
    }
  }, [setHighScores, setApiError, t]); // t is a dependency for error message translation

  // checkPossibleMoves, createInitialBoard (no changes)
  const checkPossibleMoves = useCallback((currentBoard: BoardState): boolean => {
    const rows = currentBoard.length;
    const cols = currentBoard[0].length;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const currentBall = currentBoard[r][c];
        if (!currentBall) continue;
        const currentColor = currentBall.color;
        if (c <= cols - MIN_MATCH_LENGTH) {
          let match = true;
          for (let i = 1; i < MIN_MATCH_LENGTH; i++) {
            const nextBall = currentBoard[r][c + i];
            if (!nextBall || nextBall.color !== currentColor) {
              match = false;
              break;
            }
          }
          if (match) return true;
        }
        if (r <= rows - MIN_MATCH_LENGTH) {
          let match = true;
          for (let i = 1; i < MIN_MATCH_LENGTH; i++) {
            const nextBall = currentBoard[r + i][c];
            if (!nextBall || nextBall.color !== currentColor) {
              match = false;
              break;
            }
          }
          if (match) return true;
        }
      }
    }
    return false;
  }, []);

  const createInitialBoard = useCallback((): BoardState => {
    let newBoard: BoardState;
    let hasMoves: boolean;
    let attempts = 0;
    const maxAttempts = 100; 
    do {
      newBoard = [];
      for (let r = 0; r < BOARD_ROWS; r++) {
        const row: CellState[] = [];
        for (let c = 0; c < BOARD_COLS; c++) {
          row.push(generateRandomBall());
        }
        newBoard.push(row);
      }
      hasMoves = checkPossibleMoves(newBoard);
      attempts++;
      if (attempts >= maxAttempts && !hasMoves) {
          console.warn(`Could not generate a board with possible moves after ${maxAttempts} attempts.`);
          break; 
      }
    } while (!hasMoves && attempts < maxAttempts);
    return newBoard;
  }, [checkPossibleMoves]);
  
  const [board, setBoard] = useState<BoardState>(() => createInitialBoard());
  const [selectedBalls, setSelectedBalls] = useState<SelectedBallEntity[]>([]);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Game timer useEffect (no changes here)
  useEffect(() => {
    if (isBoardUpdating || !languageSelected || !gameStarted || isGameOver || timeLeft <= 0) {
      if (timeLeft <= 0 && !isGameOver && gameStarted && languageSelected) {
        setIsGameOver(true);
      }
      return;
    }
    if (timeLeft >= 1 && timeLeft <= 5 && countdownSoundRef.current && countdownSoundRef.current.readyState >= 2) {
      countdownSoundRef.current.play().catch(error => {
        console.warn("Countdown tick sound play failed:", error);
      });
    }
    const timerId = setInterval(() => {
      setTimeLeft(prevTime => prevTime - 1);
    }, 1000);
    return () => clearInterval(timerId);
  }, [timeLeft, isGameOver, gameStarted, languageSelected, isBoardUpdating]);
  
  // useEffect to show name input (no changes here)
  useEffect(() => {
    if (isGameOver) {
      if (score > 0) {
        let qualifiesForTopDisplay = false;
        if (highScores.length < MAX_HIGH_SCORES) { 
          qualifiesForTopDisplay = true;
        } else {
           const lowestTopScore = highScores[MAX_HIGH_SCORES - 1]?.score;
           if (lowestTopScore !== undefined && score > lowestTopScore) {
               qualifiesForTopDisplay = true;
           }
        }
        setShowNameInput(qualifiesForTopDisplay);
      } else {
        setShowNameInput(false); 
      }
    } else {
      setShowNameInput(false); 
    }
  }, [isGameOver, score, highScores]); 

  // useEffect for player rank display (no changes here)
  useEffect(() => {
    if (!gameStarted || isGameOver) {
      setCurrentPlayerRankDisplay(null);
      return;
    }
    if (score === 0) {
      setCurrentPlayerRankDisplay(null);
      return;
    }
    let playerRank: number | null = null;
    let scoresBetterThanCurrent = 0;
    for (const hs of highScores) {
      if (hs.score > score) {
        scoresBetterThanCurrent++;
      }
    }
    playerRank = scoresBetterThanCurrent + 1;
    const isPotentiallyOnBoard = highScores.length < MAX_HIGH_SCORES || score > (highScores[MAX_HIGH_SCORES -1]?.score || 0);
    if (playerRank !== null && playerRank <= MAX_HIGH_SCORES && isPotentiallyOnBoard) {
      setCurrentPlayerRankDisplay(`${t('game_rank_label')} ${playerRank}`);
    } else {
      setCurrentPlayerRankDisplay(null);
    }
  }, [score, highScores, gameStarted, isGameOver, t]);

  // isAdjacent, handleBallMouseDown, handleBallMouseEnter (no changes here)
  const isAdjacent = (pos1: Position, pos2: Position): boolean => {
    const dr = Math.abs(pos1.row - pos2.row);
    const dc = Math.abs(pos1.col - pos2.col);
    return (dr === 1 && dc === 0) || (dr === 0 && dc === 1);
  };

  const handleBallMouseDown = useCallback((row: number, col: number, ball: Ball) => {
    if (isBoardUpdating || !languageSelected || !gameStarted || isGameOver || timeLeft <= 0) return;
    setIsDragging(true);
    setSelectedBalls([{ row, col, id: ball.id, color: ball.color }]);
    lastHoveredCellRef.current = { row, col }; 
  }, [isGameOver, timeLeft, gameStarted, languageSelected, isBoardUpdating]);
  
  const handleBallMouseEnter = useCallback((row: number, col: number, ball: Ball | null) => {
    if (isBoardUpdating || !languageSelected || !gameStarted || isGameOver || timeLeft <= 0 || !isDragging || selectedBalls.length === 0) return;
    const currentHoveredPos: Position = { row, col };
    const lastSelected = selectedBalls[selectedBalls.length - 1];
    const firstSelectedColor = selectedBalls[0].color;
    if (selectedBalls.length > 1) {
      const secondToLastSelected = selectedBalls[selectedBalls.length - 2];
      if (secondToLastSelected.row === row && secondToLastSelected.col === col) {
        setSelectedBalls(prev => prev.slice(0, -1));
        lastHoveredCellRef.current = currentHoveredPos; 
        return;
      }
    }
    if (selectedBalls.some(b => b.row === row && b.col === col)) return;
    const currentBoardBall = board[row][col];
    if (currentBoardBall && currentBoardBall.color === firstSelectedColor && isAdjacent(lastSelected, currentHoveredPos)) {
      setSelectedBalls(prev => [...prev, { row, col, id: currentBoardBall.id, color: currentBoardBall.color }]);
      lastHoveredCellRef.current = currentHoveredPos; 
    }
  }, [isDragging, selectedBalls, isGameOver, timeLeft, gameStarted, languageSelected, isBoardUpdating, board]);

  // processMatchAndRefill (no changes here)
  const processMatchAndRefill = useCallback(() => {
    if (selectedBalls.length < MIN_MATCH_LENGTH) {
      setSelectedBalls([]); 
      return;
    }
    setIsBoardUpdating(true); 
    const currentChainForLogic = [...selectedBalls]; 
    const activatedBombColors = new Set<BallColor>();
    currentChainForLogic.forEach(selBall => {
        const boardBall = board[selBall.row][selBall.col];
        if (boardBall?.powerUpType === 'colorBomb' && boardBall.id === selBall.id) {
            activatedBombColors.add(boardBall.color);
        }
    });
    let allBallsToDissolvePositionsSet = new Set<string>();
    currentChainForLogic.forEach(b => allBallsToDissolvePositionsSet.add(`${b.row}-${b.col}`));
    let bombEffectBallsCount = 0;
    if (activatedBombColors.size > 0) {
        for (let r = 0; r < BOARD_ROWS; r++) {
            for (let c = 0; c < BOARD_COLS; c++) {
                const currentBoardBall = board[r][c];
                if (currentBoardBall && activatedBombColors.has(currentBoardBall.color)) {
                    const positionKey = `${r}-${c}`;
                    if (!allBallsToDissolvePositionsSet.has(positionKey)) {
                        bombEffectBallsCount++;
                    }
                    allBallsToDissolvePositionsSet.add(positionKey);
                }
            }
        }
    }
    const finalDissolvingPositions = Array.from(allBallsToDissolvePositionsSet).map(s => {
        const [row, col] = s.split('-').map(Number);
        return { row, col };
    });
    setDissolvingBalls(finalDissolvingPositions);
    const chainLengthForScore = currentChainForLogic.length;
    let currentScoreGain = 0;
    if (chainLengthForScore > 0) {
        currentScoreGain += (chainLengthForScore * 10 * chainLengthForScore);
    }
    currentScoreGain += bombEffectBallsCount * COLOR_BOMB_EFFECT_POINTS_PER_BALL;
    if (currentScoreGain > 0) {
      if (matchSoundRef.current && matchSoundRef.current.readyState >= 2) {
        matchSoundRef.current.play().catch(error => console.warn("Match success sound play failed:", error));
      }
      setScore(prevScore => prevScore + currentScoreGain); 
      let timeBonus = 0;
      const userDrawnChainLength = currentChainForLogic.length;
      if (userDrawnChainLength === 4) timeBonus = 2;
      else if (userDrawnChainLength === 5) timeBonus = 4;
      else if (userDrawnChainLength === 6) timeBonus = 6;
      else if (userDrawnChainLength === 7) timeBonus = 8;
      else if (userDrawnChainLength === 8) timeBonus = 10;
      else if (userDrawnChainLength > 8) timeBonus = 12;
      if (timeBonus > 0) setTimeLeft(prevTime => prevTime + timeBonus);
    }
    setSelectedBalls([]); 
    setTimeout(() => {
      let newBoard = board.map(row => [...row]); 
      let actualBallsRemovedCount = 0;
      finalDissolvingPositions.forEach(pos => {
        if (newBoard[pos.row][pos.col]) { 
          newBoard[pos.row][pos.col] = null;
          actualBallsRemovedCount++;
        }
      });
      if (actualBallsRemovedCount > 0) {
        for (let c = 0; c < BOARD_COLS; c++) {
          let emptyRowInCol = BOARD_ROWS - 1; 
          for (let r = BOARD_ROWS - 1; r >= 0; r--) {
            if (newBoard[r][c] !== null) { 
              if (r !== emptyRowInCol) { 
                newBoard[emptyRowInCol][c] = newBoard[r][c]; 
                newBoard[r][c] = null; 
              }
              emptyRowInCol--; 
            }
          }
        }
        for (let r = 0; r < BOARD_ROWS; r++) {
          for (let c = 0; c < BOARD_COLS; c++) {
            if (newBoard[r][c] === null) {
              newBoard[r][c] = generateRandomBall();
            }
          }
        }
        setBoard(newBoard); 
        if (!checkPossibleMoves(newBoard)) {
            setIsGameOver(true); 
        }
      }
      setDissolvingBalls([]); 
      setIsBoardUpdating(false); 
    }, DISSOLVE_ANIMATION_DURATION_MS);
  }, [board, selectedBalls, checkPossibleMoves, setIsGameOver, setScore, setTimeLeft, setBoard]);

  // useEffect for global mouse/touch handlers (no changes here)
  useEffect(() => {
    const handleMouseUpGlobal = () => {
      if (isBoardUpdating) return; 
      if (isDragging) {
        if (selectedBalls.length >= MIN_MATCH_LENGTH) {
          processMatchAndRefill();
        } else {
          setSelectedBalls([]); 
        }
        setIsDragging(false);
        lastHoveredCellRef.current = null;
      }
    };
    const handleTouchEndGlobal = (event: TouchEvent) => {
      if (isBoardUpdating) return; 
      if (isDragging) {
        if (event.touches.length === 0) { 
            if (selectedBalls.length >= MIN_MATCH_LENGTH) {
                processMatchAndRefill();
            } else {
                setSelectedBalls([]); 
            }
            setIsDragging(false);
            lastHoveredCellRef.current = null;
        }
      }
    };
    const handleTouchMoveGlobal = (event: TouchEvent) => {
      if (isBoardUpdating || !isDragging || !gridElementRef.current || event.touches.length === 0 || gameAreaScale === 0) {
        return;
      }
      event.preventDefault(); 
      const touch = event.touches[0];
      const gridRect = gridElementRef.current.getBoundingClientRect();
      const relativeX = touch.clientX - gridRect.left;
      const relativeY = touch.clientY - gridRect.top;
      const unscaledRelativeX = relativeX / gameAreaScale;
      const unscaledRelativeY = relativeY / gameAreaScale;
      let targetCol = Math.floor(unscaledRelativeX / effectiveCellSize);
      let targetRow = Math.floor(unscaledRelativeY / effectiveCellSize);
      targetCol = Math.max(0, Math.min(BOARD_COLS - 1, targetCol));
      targetRow = Math.max(0, Math.min(BOARD_ROWS - 1, targetRow));
      if (lastHoveredCellRef.current && lastHoveredCellRef.current.row === targetRow && lastHoveredCellRef.current.col === targetCol) {
        return; 
      }
      if (targetRow >= 0 && targetRow < BOARD_ROWS && targetCol >= 0 && targetCol < BOARD_COLS) {
        const currentBall = board[targetRow][targetCol];
        handleBallMouseEnter(targetRow, targetCol, currentBall); 
      }
    };
    if (languageSelected && gameStarted && !isGameOver && timeLeft > 0) {
        document.addEventListener('mouseup', handleMouseUpGlobal);
        document.addEventListener('touchend', handleTouchEndGlobal);
        document.addEventListener('touchmove', handleTouchMoveGlobal, { passive: false }); 
    }
    return () => {
      document.removeEventListener('mouseup', handleMouseUpGlobal);
      document.removeEventListener('touchend', handleTouchEndGlobal);
      document.removeEventListener('touchmove', handleTouchMoveGlobal);
    };
  }, [
    isDragging, selectedBalls, processMatchAndRefill, isGameOver, timeLeft, gameStarted, languageSelected,
    board, handleBallMouseEnter, isBoardUpdating, gameAreaScale, effectiveCellSize
  ]);

  // handleResetGame, handleStartGame (no major changes, apiError reset)
  const handleResetGame = useCallback(() => {
    setIsGameOver(false);
    setScore(0);
    setTimeLeft(GAME_DURATION_SECONDS);
    setBoard(createInitialBoard());
    setSelectedBalls([]);
    setIsDragging(false);
    setShowNameInput(false);
    setPlayerName("");
    lastHoveredCellRef.current = null;
    setDissolvingBalls([]); 
    setIsBoardUpdating(false);
    setGameStarted(false); 
    setShowOptionsPage(false); 
    setCurrentOptionsView('main'); 
    setShowInstructionsPage(false);
    setShowFullLeaderboardPage(false); 
    setCurrentPlayerRankDisplay(null);
    setGameBoardBackgroundUrl(null); 
    setApiError(null); // Reset API error on game reset
  }, [createInitialBoard]);

  const handleStartGame = () => {
    handleResetGame(); 
    let backgroundForThisSession: string | null;
    const backgroundImages = [
        '/images/backgrounds/background-1.jpg', '/images/backgrounds/background-2.jpg',
        '/images/backgrounds/background-3.jpg', '/images/backgrounds/background-4.jpg',
        '/images/backgrounds/background-5.jpg',
    ];
    if (ballStyle === 'nintendo_png') {
        backgroundForThisSession = '/images/backgrounds/nintendo-background.jpg';
    } else if (ballStyle === 'polityk_png') {
        backgroundForThisSession = '/images/backgrounds/polityk-background.jpg';
    } else {
        const randomIndex = Math.floor(Math.random() * backgroundImages.length);
        backgroundForThisSession = backgroundImages[randomIndex];
    }
    setGameBoardBackgroundUrl(backgroundForThisSession);
    setGameStarted(true);
  };

  // Modified handleNameSubmit to use async addHighScore
  const handleNameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (playerName.trim() && !isSubmittingScore) {
      const success = await addHighScore(playerName, score);
      if (success) {
        setShowNameInput(false);
        setPlayerName("");
        // Game Over screen will show briefly, then player clicks to go to Welcome
        // Or, we can navigate away from Game Over screen automatically
        setIsGameOver(false); 
        setGameStarted(false); 
      } 
      // If !success, apiError is set by addHighScore and will be displayed on the name input screen
    }
  };
  
  const handleLanguageSelect = (lang: Language) => {
    setLanguage(lang);
    setLanguageSelected(true);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(event.target.value);
    setMusicVolume(newVolume);
    if (backgroundMusicRef.current) {
        backgroundMusicRef.current.volume = newVolume;
    }
  };

  // --- RENDER LOGIC ---

  if (!languageSelected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-white p-6 bg-slate-900">
        <h1 className="text-4xl sm:text-5xl font-bold mb-8 text-center text-yellow-400">{allTranslations.selectLanguageTitle.en} / {allTranslations.selectLanguageTitle.pl}</h1>
        <div className="space-y-4 sm:space-y-0 sm:space-x-6 flex flex-col sm:flex-row">
          <button onClick={() => handleLanguageSelect('en')} className="px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg shadow-xl text-xl sm:text-2xl transition-all duration-150 ease-in-out focus:outline-none focus:ring-4 focus:ring-blue-400 focus:ring-opacity-75 hover:scale-105 active:scale-95">{allTranslations.languageEnglish.en}</button>
          <button onClick={() => handleLanguageSelect('pl')} className="px-8 py-4 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg shadow-xl text-xl sm:text-2xl transition-all duration-150 ease-in-out focus:outline-none focus:ring-4 focus:ring-red-400 focus:ring-opacity-75 hover:scale-105 active:scale-95">{allTranslations.languagePolish.pl}</button>
        </div>
      </div>
    );
  }

  // Full Leaderboard Page: Display loading/error states
  if (showFullLeaderboardPage) {
    const fullLeaderboardScores = highScores.slice(0, MAX_HIGH_SCORES);
    const totalScores = fullLeaderboardScores.length;
    const col1Count = Math.ceil(totalScores / 3);
    const col2Count = Math.ceil((totalScores - col1Count) / 2);
    const column1Scores = fullLeaderboardScores.slice(0, col1Count);
    const column2Scores = fullLeaderboardScores.slice(col1Count, col1Count + col2Count);
    const column3Scores = fullLeaderboardScores.slice(col1Count + col2Count);
    const renderScoreList = (scores: HighScoreEntry[], startRank: number) => (
      <ol className="list-decimal list-inside space-y-1 text-slate-300" start={startRank}>
        {scores.map((entry, index) => (
          <li key={`full-col-${startRank + index}`} className="text-sm mb-3 text-slate-300">
            <span className="block font-medium text-purple-400">{entry.name}</span>
            <span className="block text-xs">{`${t('welcome_score_label')}: `}<span className="text-yellow-400 font-semibold">{entry.score}</span></span>
            {entry.date && (<span className="block text-xs">{`${t('welcome_date_label')}: `}<span className="text-slate-500">{entry.date}</span></span>)}
          </li>
        ))}
      </ol>
    );
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-white p-6 bg-slate-900">
        <h1 className="text-4xl sm:text-5xl font-bold mb-8 text-center text-yellow-400">{t('full_leaderboard_page_title')}</h1>
        <div className="bg-slate-800 p-6 rounded-lg shadow-xl w-full max-w-3xl">
          {isLoadingHighScores && <p className="text-slate-400 text-center">{t('api_loading_scores')}</p>}
          {apiError && !isLoadingHighScores && <p className="text-red-400 text-center py-2">{apiError}</p>}
          {!isLoadingHighScores && !apiError && fullLeaderboardScores.length > 0 ? (
            <div className="flex flex-row -mx-2"> 
              <div className="w-1/3 px-2">{renderScoreList(column1Scores, 1)}</div>
              <div className="w-1/3 px-2">{column2Scores.length > 0 && renderScoreList(column2Scores, column1Scores.length + 1)}</div>
              <div className="w-1/3 px-2">{column3Scores.length > 0 && renderScoreList(column3Scores, column1Scores.length + column2Scores.length + 1)}</div>
            </div>
          ) : (!isLoadingHighScores && !apiError && <p className="text-slate-400 text-center">{t('welcome_no_high_scores')}</p>)}
        </div>
        <button onClick={() => setShowFullLeaderboardPage(false)} className="mt-8 px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg shadow-xl text-xl transition-all duration-150 ease-in-out focus:outline-none focus:ring-4 focus:ring-blue-400 focus:ring-opacity-75 hover:scale-105 active:scale-95">{t('instructions_back_button_text')}</button>
      </div>
    );
  }

  // Options pages (no direct changes related to high scores API)
  if (showOptionsPage) {
    if (currentOptionsView === 'main') {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen text-white p-6 bg-slate-900">
          <h1 className="text-4xl sm:text-5xl font-bold mb-12 text-center text-yellow-400">{t('options_main_title')}</h1>
          <div className="space-y-5 w-full max-w-sm">
            <button onClick={() => setCurrentOptionsView('music')} className="w-full px-8 py-4 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl shadow-xl text-xl sm:text-2xl transition-all duration-150 ease-in-out focus:outline-none focus:ring-4 focus:ring-green-400 focus:ring-opacity-75 hover:scale-105 active:scale-95">{t('options_music_button_text')}</button>
            <button onClick={() => setCurrentOptionsView('graphics')} className="w-full px-8 py-4 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl shadow-xl text-xl sm:text-2xl transition-all duration-150 ease-in-out focus:outline-none focus:ring-4 focus:ring-green-400 focus:ring-opacity-75 hover:scale-105 active:scale-95">{t('options_graphics_button_text')}</button>
            <button onClick={() => setCurrentOptionsView('graphics_custom')} className="w-full px-8 py-4 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl shadow-xl text-xl sm:text-2xl transition-all duration-150 ease-in-out focus:outline-none focus:ring-4 focus:ring-green-400 focus:ring-opacity-75 hover:scale-105 active:scale-95">{t('graphics_options_custom_styles_button_text')}</button>
            <button onClick={() => setCurrentOptionsView('grid_size')} className="w-full px-8 py-4 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl shadow-xl text-xl sm:text-2xl transition-all duration-150 ease-in-out focus:outline-none focus:ring-4 focus:ring-green-400 focus:ring-opacity-75 hover:scale-105 active:scale-95">{t('options_grid_size_button_text')}</button>
          </div>
          <button onClick={() => { setShowOptionsPage(false); setCurrentOptionsView('main');}} className="mt-12 px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg shadow-xl text-xl transition-all duration-150 ease-in-out focus:outline-none focus:ring-4 focus:ring-blue-400 focus:ring-opacity-75 hover:scale-105 active:scale-95">{t('options_back_button_text')}</button>
        </div>);
    } else if (currentOptionsView === 'music') {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen text-white p-6 bg-slate-900">
          <h1 className="text-4xl sm:text-5xl font-bold mb-8 text-center text-yellow-400">{t('music_options_page_title')}</h1>
          <div className="bg-slate-800 p-6 rounded-lg shadow-xl max-w-md w-full">
            <div className="space-y-3">
              {MUSIC_TRACKS.map((track) => (<button key={track.path} onClick={() => setCurrentMusicPath(track.path)} className={`w-full px-6 py-3 font-semibold rounded-lg shadow-md transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 ${currentMusicPath === track.path ? 'bg-purple-600 text-white ring-purple-400' : 'bg-slate-600 hover:bg-slate-500 text-slate-200 ring-slate-400'} hover:scale-105 active:scale-95`}>{t(track.nameKey as keyof typeof allTranslations)}</button>))}
            </div>
            <div className="mt-8 w-full">
              <label htmlFor="volumeSlider" className="block text-lg font-medium text-slate-300 mb-2 text-center">{t('options_volume_label')}</label>
              <input id="volumeSlider" type="range" min="0" max="1" step="0.01" value={musicVolume} onChange={handleVolumeChange} className="w-full h-3 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-opacity-75" aria-label={t('options_volume_aria_label')} />
              <div className="text-center text-sm text-slate-400 mt-1">{(musicVolume * 100).toFixed(0)}%</div>
            </div>
          </div>
          <button onClick={() => setCurrentOptionsView('main')} className="mt-8 px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg shadow-xl text-xl transition-all duration-150 ease-in-out focus:outline-none focus:ring-4 focus:ring-blue-400 focus:ring-opacity-75 hover:scale-105 active:scale-95">{t('options_back_to_main_options_button_text')}</button>
        </div>);
    } else if (currentOptionsView === 'graphics') {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen text-white p-6 bg-slate-900">
          <h1 className="text-4xl sm:text-5xl font-bold mb-8 text-center text-yellow-400">{t('graphics_options_page_title')}</h1>
          <div className="bg-slate-800 p-6 rounded-lg shadow-xl max-w-md w-full">
            {(['default', 'heart', 'gemstone', 'square', 'custom_png'] as BallStyle[]).map((styleKey, idx) => (
              <div key={styleKey} onClick={() => setBallStyle(styleKey)} onKeyDown={(e) => e.key === 'Enter' && setBallStyle(styleKey)} role="button" tabIndex={0} aria-pressed={ballStyle === styleKey} aria-label={t(`graphics_options_style_${styleKey}` as keyof typeof allTranslations)} className={`p-4 rounded-lg cursor-pointer transition-all duration-150 ease-in-out ${idx > 0 ? 'mt-6' : ''} focus:outline-none focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-purple-400 ${ballStyle === styleKey ? 'bg-slate-700 ring-2 ring-purple-500 shadow-lg' : 'bg-slate-600 hover:bg-slate-500/80 hover:shadow-md'}`}>
                <div className="flex flex-wrap justify-center items-center gap-2 p-2 bg-slate-500/40 rounded-md min-h-[60px]">
                  {BALL_COLORS.map(color => (<BallCell key={`preview-${styleKey}-${color}`} ball={{ id: `preview-${styleKey}-${color}`, color, powerUpType: undefined }} isSelected={false} isDissolving={false} onMouseDown={() => {}} onMouseEnter={() => {}} ballStyle={styleKey} isPreview={true} />))}
                </div>
              </div>
            ))}
          </div>
          <button onClick={() => setCurrentOptionsView('main')} className="mt-8 px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg shadow-xl text-xl transition-all duration-150 ease-in-out focus:outline-none focus:ring-4 focus:ring-blue-400 focus:ring-opacity-75 hover:scale-105 active:scale-95">{t('options_back_to_main_options_button_text')}</button>
        </div>);
    } else if (currentOptionsView === 'graphics_custom') {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen text-white p-6 bg-slate-900">
          <h1 className="text-4xl sm:text-5xl font-bold mb-8 text-center text-yellow-400">{t('custom_styles_page_title')}</h1>
          <div className="bg-slate-800 p-6 rounded-lg shadow-xl max-w-md w-full">
            {(['nintendo_png', 'polityk_png'] as BallStyle[]).map((styleKey, idx) => (
              <div key={styleKey} onClick={() => setBallStyle(styleKey)} onKeyDown={(e) => e.key === 'Enter' && setBallStyle(styleKey)} role="button" tabIndex={0} aria-pressed={ballStyle === styleKey} aria-label={t(`graphics_options_style_${styleKey}` as keyof typeof allTranslations)} className={`p-4 rounded-lg cursor-pointer transition-all duration-150 ease-in-out ${idx > 0 ? 'mt-6' : ''} focus:outline-none focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-purple-400 ${ballStyle === styleKey ? 'bg-slate-700 ring-2 ring-purple-500 shadow-lg' : 'bg-slate-600 hover:bg-slate-500/80 hover:shadow-md'}`}>
                <div className="flex flex-wrap justify-center items-center gap-2 p-2 bg-slate-500/40 rounded-md min-h-[60px]">
                  {BALL_COLORS.map(color => (<BallCell key={`preview-${styleKey}-${color}`} ball={{ id: `preview-${styleKey}-${color}`, color, powerUpType: undefined }} isSelected={false} isDissolving={false} onMouseDown={() => {}} onMouseEnter={() => {}} ballStyle={styleKey} isPreview={true} />))}
                </div>
              </div>
            ))}
          </div>
          <button onClick={() => setCurrentOptionsView('main')} className="mt-8 px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg shadow-xl text-xl transition-all duration-150 ease-in-out focus:outline-none focus:ring-4 focus:ring-blue-400 focus:ring-opacity-75 hover:scale-105 active:scale-95">{t('options_back_to_main_options_button_text')}</button>
        </div>);
    } else if (currentOptionsView === 'grid_size') {
      const sizeOptions: { key: GridSizeOption, labelKey: keyof typeof allTranslations, descKey: keyof typeof allTranslations }[] = [
        { key: 'smartphone', labelKey: 'grid_size_option_smartphone_label', descKey: 'grid_size_option_smartphone_desc' },
        { key: 'medium', labelKey: 'grid_size_option_medium_label', descKey: 'grid_size_option_medium_desc' },
        { key: 'large', labelKey: 'grid_size_option_large_label', descKey: 'grid_size_option_large_desc' },
      ];
      return (
        <div className="flex flex-col items-center justify-center min-h-screen text-white p-6 bg-slate-900">
          <h1 className="text-4xl sm:text-5xl font-bold mb-8 text-center text-yellow-400">{t('grid_size_options_page_title')}</h1>
          <div className="bg-slate-800 p-6 rounded-lg shadow-xl max-w-lg w-full space-y-4">
            {sizeOptions.map(option => (<button key={option.key} onClick={() => setCurrentGridSizeOption(option.key)} className={`w-full p-4 text-left font-semibold rounded-lg shadow-md transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 ${currentGridSizeOption === option.key ? 'bg-purple-600 text-white ring-purple-400' : 'bg-slate-600 hover:bg-slate-500 text-slate-200 ring-slate-400'} hover:scale-102 active:scale-98`}><span className="block text-lg">{t(option.labelKey)}</span><span className="block text-xs text-slate-300 font-normal">{t(option.descKey)}</span></button>))}
          </div>
          <button onClick={() => setCurrentOptionsView('main')} className="mt-8 px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg shadow-xl text-xl transition-all duration-150 ease-in-out focus:outline-none focus:ring-4 focus:ring-blue-400 focus:ring-opacity-75 hover:scale-105 active:scale-95">{t('options_back_to_main_options_button_text')}</button>
        </div>);
    }
  }

  // Instructions Page (no changes)
  if (showInstructionsPage) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-white p-6 bg-slate-900">
        <h1 className="text-4xl sm:text-5xl font-bold mb-8 text-center text-yellow-400">{t('instructions_page_title')}</h1>
        <div className="bg-slate-800 p-6 rounded-lg shadow-xl max-w-2xl w-full space-y-4 text-slate-300">
          <p className="text-lg">{t('welcome_instructions_p1')}</p>
          <p className="text-lg">{t('welcome_instructions_p2')}</p>
          <hr className="border-slate-700" />
          <p className="text-md">{t('welcome_time_bonus_info')}</p>
          <hr className="border-slate-700" />
          <p className="text-md">{t('welcome_scoring_info')}</p>
          <p className="text-md">{t('welcome_scoring_example')}</p>
          <hr className="border-slate-700" />
          <div><h3 className="text-xl font-semibold text-purple-300 mb-1">{t('welcome_powerup_color_bomb_title')}</h3><p className="text-md">{t('welcome_powerup_color_bomb_desc')}</p></div>
        </div>
        <button onClick={() => setShowInstructionsPage(false)} className="mt-8 px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg shadow-xl text-xl transition-all duration-150 ease-in-out focus:outline-none focus:ring-4 focus:ring-blue-400 focus:ring-opacity-75 hover:scale-105 active:scale-95">{t('instructions_back_button_text')}</button>
      </div>
    );
  }

  // Game Over / High Score Input Screen: Display API error if submission fails
  if (isGameOver) { 
    if (showNameInput) { 
      return (
        <div className="flex flex-col items-center justify-center min-h-screen text-white p-4 bg-slate-900">
          <h2 className="text-3xl sm:text-4xl font-bold text-yellow-400 mb-3">{t('highscore_new_title')}</h2>
          <p className="text-2xl sm:text-3xl mb-6">{t('gameover_your_score_label')}: <span className="font-semibold">{score}</span></p>
          <form onSubmit={handleNameSubmit} className="w-full max-w-xs flex flex-col items-center">
            <label htmlFor="playerName" className="text-lg mb-2 self-start">{t('highscore_enter_name_label')}</label>
            <input type="text" id="playerName" value={playerName} onChange={(e) => setPlayerName(e.target.value.slice(0,15))} className="w-full px-4 py-2 mb-4 border border-slate-500 rounded-md bg-slate-700 text-white focus:ring-2 focus:ring-purple-500 outline-none" maxLength={15} required aria-label={t('highscore_player_name_input_aria')} />
            {apiError && <p className="text-red-400 text-sm mb-3 text-center">{apiError}</p>}
            <button type="submit" disabled={isSubmittingScore} className={`px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow-xl text-xl transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-purple-400 ${isSubmittingScore ? 'opacity-50 cursor-not-allowed' : ''}`} aria-label={t('highscore_submit_button_aria')}>
              {isSubmittingScore ? t('api_loading_scores') : t('highscore_submit_button_text')}
            </button>
          </form>
        </div>
      );
    }
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-white p-4 bg-slate-900">
        <h1 className="text-5xl sm:text-6xl font-bold text-red-500 mb-4 animate-pulse">{t('gameover_title')}</h1>
        <p className="text-2xl sm:text-3xl mb-2">{timeLeft <= 0 ? t('gameover_times_up_message') : t('gameover_no_moves_message')}</p>
        <p className="text-2xl sm:text-3xl mb-8">{t('gameover_your_score_label')}: <span className="text-yellow-400 font-semibold">{score}</span></p>
        <button onClick={() => { setIsGameOver(false); setGameStarted(false); setShowNameInput(false); setPlayerName(""); setApiError(null); }} className="px-8 py-4 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg shadow-xl text-xl sm:text-2xl transition-all duration-150 ease-in-out focus:outline-none focus:ring-4 focus:ring-green-400 focus:ring-opacity-75 hover:scale-105 active:scale-95" aria-label={t('gameover_back_to_welcome_button_aria')}>{t('gameover_back_to_welcome_button_text')}</button>
      </div>
    );
  }

  // Welcome Screen: Display loading/error states for high scores
  if (!gameStarted) { 
    const scoresToDisplayOnWelcome = highScores.slice(0, TOP_SCORES_TO_DISPLAY);
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-white p-6 bg-slate-900">
        <h1 className="text-5xl sm:text-7xl font-extrabold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-500 via-pink-500 to-red-600">{t('welcome_title')}</h1>
        <p className="text-lg sm:text-xl text-slate-300 mb-6 text-center max-w-md">{t('welcome_brief_intro')}</p>
        <div className="mb-8 p-4 bg-slate-800 rounded-lg shadow-md w-full max-w-md">
          <h2 className="text-2xl font-semibold text-yellow-400 mb-4 text-center">{t('welcome_top_scores_title')}</h2>
          {isLoadingHighScores && <p className="text-slate-400 text-center">{t('api_loading_scores')}</p>}
          {apiError && !isLoadingHighScores && <p className="text-red-400 text-center py-2">{apiError}</p>}
          {!isLoadingHighScores && !apiError && scoresToDisplayOnWelcome.length > 0 ? (
            <div className="flex flex-row flex-wrap justify-around items-start">
              {scoresToDisplayOnWelcome.map((entry, index) => (
                <div key={`welcome-hs-${index}`} className="text-center px-1 mb-2">
                  <p className="text-base whitespace-nowrap"><span className="font-medium text-purple-300">{index + 1}. {entry.name}: </span><span className="text-yellow-400 font-semibold">{entry.score}</span></p>
                  {entry.date && (<p className="text-xs text-slate-500">({entry.date})</p>)}
                </div>
              ))}
            </div>
          ) : (!isLoadingHighScores && !apiError && <p className="text-slate-400 text-center">{t('welcome_no_high_scores')}</p>)}
        </div>
        <div className="flex flex-col space-y-4 w-full max-w-xs sm:max-w-sm">
            <button onClick={handleStartGame} className="w-full px-10 py-5 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl shadow-xl text-2xl sm:text-3xl transition-all duration-150 ease-in-out focus:outline-none focus:ring-4 focus:ring-green-400 focus:ring-opacity-75 hover:scale-105 active:scale-95" aria-label={t('welcome_start_button_aria')}>{t('welcome_start_button_text')}</button>
            <button onClick={() => setShowInstructionsPage(true)} className="w-full px-8 py-4 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-xl shadow-xl text-xl sm:text-2xl transition-all duration-150 ease-in-out focus:outline-none focus:ring-4 focus:ring-sky-400 focus:ring-opacity-75 hover:scale-105 active:scale-95">{t('welcome_instructions_button_text')}</button>
            <button onClick={() => setShowFullLeaderboardPage(true)} className="w-full px-8 py-4 bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-xl shadow-xl text-xl sm:text-2xl transition-all duration-150 ease-in-out focus:outline-none focus:ring-4 focus:ring-teal-400 focus:ring-opacity-75 hover:scale-105 active:scale-95">{t('welcome_full_leaderboard_button_text')}</button>
            <button onClick={() => { setShowOptionsPage(true); setCurrentOptionsView('main'); }} className="w-full px-8 py-4 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded-xl shadow-xl text-xl sm:text-2xl transition-all duration-150 ease-in-out focus:outline-none focus:ring-4 focus:ring-indigo-400 focus:ring-opacity-75 hover:scale-105 active:scale-95">{t('welcome_options_button_text')}</button>
        </div>
         <footer className="absolute bottom-6 text-xs text-slate-500">{t('welcome_footer_built_with')}</footer>
      </div>
    );
  }

  // Active Game Screen (no changes here related to high scores API)
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-white p-4 relative overflow-hidden">
      <header className="mb-6 text-center"><h1 className="text-4xl sm:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">{t('game_header_title')}</h1></header>
      <div className="flex flex-col items-center">
        <div className="mb-1 sm:mb-2 flex items-center justify-around px-1 sm:px-2" style={{ width: `${(effectiveCellSize * BOARD_COLS + 16) * gameAreaScale}px` }}>
          <div className="text-xl sm:text-2xl font-semibold bg-slate-700 px-3 py-1 sm:px-4 sm:py-2 rounded-lg shadow flex items-baseline"><span>{t('game_score_display_label')}:</span><span className="text-yellow-400 ml-1">{score}</span></div>
          <div className="text-xl sm:text-2xl font-semibold bg-slate-700 px-3 py-1 sm:px-4 sm:py-2 rounded-lg shadow flex items-baseline"><span>{t('game_time_display_label')}:</span><span className={`ml-1 ${timeLeft <= 10 && timeLeft > 5 ? "text-orange-400" : timeLeft <= 5 ? "text-red-500 animate-pulse" : "text-green-400"}`}>{formatTime(timeLeft)}</span></div>
        </div>
        <div className="h-7 mb-1 flex items-center justify-center" role="status" aria-live="polite">
          {currentPlayerRankDisplay && (<span className="text-center text-sm sm:text-base text-purple-300 font-semibold">{currentPlayerRankDisplay}</span>)}
        </div>
        <div style={{ transform: `scale(${gameAreaScale})`, transformOrigin: 'top center', transition: 'transform 0.2s ease-out' }}>
          <GameBoard gridRef={gridElementRef} board={board} selectedBalls={selectedBalls} dissolvingBalls={dissolvingBalls} onBallMouseDown={handleBallMouseDown} onBallMouseEnter={handleBallMouseEnter} backgroundImageUrl={gameBoardBackgroundUrl} ballStyle={ballStyle} effectiveCellSize={effectiveCellSize} effectiveLineStrokeWidth={effectiveLineStrokeWidth} effectiveHeartTextSizeClass={effectiveHeartTextSizeClass} effectivePowerUpRingStyles={effectivePowerUpRingStyles} />
        </div>
      </div>
      <button onClick={handleResetGame} className="mt-6 px-6 py-3 bg-pink-600 hover:bg-pink-700 text-white font-semibold rounded-lg shadow-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-opacity-75 text-base" aria-label={t('game_reset_button_aria')}>{t('game_reset_button_text')}</button>
      <footer className="mt-4 sm:mt-6 text-xs sm:text-sm text-slate-400 text-center">{t('game_footer_instruction')}</footer>
    </div>
  );
};

export default App;
