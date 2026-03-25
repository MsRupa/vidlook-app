// Translations for VidLook App
// Note: VidLook, $VIDEO, and WLD are kept unchanged in all languages

export const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸', country: 'US' },
  { code: 'es', name: 'Español', flag: '🇦🇷', country: 'AR' },
  { code: 'th', name: 'ไทย', flag: '🇹🇭', country: 'TH' },
  { code: 'ja', name: '日本語', flag: '🇯🇵', country: 'JP' }
];

// Map country codes to default language
export const COUNTRY_TO_LANGUAGE = {
  'AR': 'es', // Argentina -> Spanish
  'TH': 'th', // Thailand -> Thai
  'JP': 'ja', // Japan -> Japanese
};

export const translations = {
  en: {
    // Welcome Screen
    welcome: {
      tagline: 'Watch YouTube & Earn WLD',
      feature1Title: 'Watch Trending Videos',
      feature1Desc: 'Discover trending content',
      feature2Title: 'Earn $VIDEO Tokens',
      feature2Desc: '2 $VIDEO per minute watched',
      feature3Title: 'Convert to WLD',
      feature3Desc: '1000 $VIDEO = 1 WLD',
      connectWallet: 'Connect Wallet',
      connecting: 'Connecting...',
      selectLanguage: 'Select Language'
    },
    
    // Home Screen
    home: {
      searchPlaceholder: 'Search videos...',
      resultsFor: '{count} results for "{query}"',
      clear: 'Clear',
      trendingIn: 'Trending in {country}',
      yourRegion: 'your region',
      sponsored: 'SPONSORED',
      sponsoredEarn: 'Earn 5 $VIDEO per minute',
      earning: 'Earning $VIDEO'
    },
    
    // Profile Screen
    profile: {
      logout: 'Logout',
      videoBalance: '$VIDEO Balance',
      watchTime: 'Watch Time',
      totalEarned: 'Total Earned',
      joined: 'Joined',
      tasksRewards: 'Tasks & Rewards',
      claim: 'Claim',
      faq: 'FAQ',
      faq1Question: 'How do I contact the VidLook team?',
      faq1Answer: 'Visit:',
      faq2Question: 'When will I receive my converted WLDs?',
      faq2Answer: 'WLDs are sent directly to your connected wallet within 24 hours of conversion.',
      faq3Question: 'What is the earning rate for videos?',
      faq3Answer: 'Sponsored videos: 5 $VIDEO per minute. Regular videos: 2 $VIDEO per minute.',
      faq4Question: 'How does VidLook make money?',
      faq4Answer: 'VidLook generates revenue from third-party ads displayed between videos and shares a portion of that ad revenue with our users through $VIDEO tokens. The more you watch, the more we earn together - it\'s that simple!',
      recentActivity: 'Recent Activity',
      noHistory: 'No watch history yet',
      startWatching: 'Start watching to earn tokens!',
      videoWatched: 'Video watched'
    },
    
    // Convert Screen
    convert: {
      title: 'Convert Tokens',
      rate: '1000 $VIDEO = 1 WLD',
      availableBalance: 'Available Balance',
      videoTokens: '$VIDEO Tokens',
      amountToConvert: 'Amount to Convert',
      enterAmount: 'Enter $VIDEO amount',
      max: 'Max',
      youWillReceive: 'You will receive',
      convertButton: 'Convert to WLD',
      converting: 'Converting...',
      minimum: 'Minimum conversion: 5000 $VIDEO tokens',
      conversionsStartDate: 'Conversions will begin in June 2026',
      history: 'Conversion History',
      noConversions: 'No conversions yet',
      convertFirst: 'Convert your first tokens above!',
      confirmationMsg: 'You will receive {amount} WLD within 24 hours',
      successMsg: 'Successfully converted {video} $VIDEO to {wld} WLD!',
      errorMinimum: 'Minimum conversion is 5000 $VIDEO tokens',
      errorInsufficient: 'Insufficient $VIDEO tokens',
      errorFailed: 'Conversion failed. Please try again.',
      comingSoon: '🚀 Conversions launching June 2026! Keep earning $VIDEO — redeem for WLD soon!'
    },
    
    // Tasks
    tasks: {
      dailyLogin: 'Daily Login Bonus',
      followX: 'Follow VidLook on X',
      postX: 'Post about VidLook on X',
      watch1Hour: 'Watch 1 Hour Total'
    },
    
    // Bottom Nav
    nav: {
      home: 'Home',
      convert: 'Convert',
      profile: 'Profile'
    },
    
    // Error Screen
    error: {
      title: 'World App Required',
      message: 'VidLook can only be opened inside the World App. Please open this mini app from the World App to continue.',
      downloadTitle: 'Don\'t have World App?',
      downloadButton: 'Download World App'
    }
  },
  
  es: {
    // Pantalla de Bienvenida
    welcome: {
      tagline: 'Mirá YouTube y Ganá WLD',
      feature1Title: 'Mirá Videos en Tendencia',
      feature1Desc: 'Descubrí contenido popular',
      feature2Title: 'Ganá $VIDEO Tokens',
      feature2Desc: '2 $VIDEO por minuto visto',
      feature3Title: 'Convertí a WLD',
      feature3Desc: '1000 $VIDEO = 1 WLD',
      connectWallet: 'Conectar Billetera',
      connecting: 'Conectando...',
      selectLanguage: 'Elegir Idioma'
    },
    
    // Pantalla Principal
    home: {
      searchPlaceholder: 'Buscar videos...',
      resultsFor: '{count} resultados para "{query}"',
      clear: 'Limpiar',
      trendingIn: 'Tendencias en {country}',
      yourRegion: 'tu región',
      sponsored: 'PATROCINADO',
      sponsoredEarn: 'Ganá 5 $VIDEO por minuto',
      earning: 'Ganando $VIDEO'
    },
    
    // Pantalla de Perfil
    profile: {
      logout: 'Salir',
      videoBalance: 'Balance $VIDEO',
      watchTime: 'Tiempo Visto',
      totalEarned: 'Total Ganado',
      joined: 'Registrado',
      tasksRewards: 'Tareas y Recompensas',
      claim: 'Reclamar',
      faq: 'Preguntas Frecuentes',
      faq1Question: '¿Cómo contacto al equipo de VidLook?',
      faq1Answer: 'Visita:',
      faq2Question: '¿Cuándo recibo mis WLDs convertidos?',
      faq2Answer: 'Los WLDs se envían directamente a tu billetera dentro de las 24 horas.',
      faq3Question: '¿Cuánto gano por ver videos?',
      faq3Answer: 'Videos patrocinados: 5 $VIDEO por minuto. Videos regulares: 2 $VIDEO por minuto.',
      faq4Question: '¿Cómo gana dinero VidLook?',
      faq4Answer: 'VidLook genera ingresos de anuncios de terceros que se muestran entre los videos y comparte una parte de esos ingresos publicitarios con nuestros usuarios a través de tokens $VIDEO. ¡Cuanto más mirás, más ganamos juntos - así de simple!',
      recentActivity: 'Actividad Reciente',
      noHistory: 'Sin historial de videos',
      startWatching: '¡Empezá a ver para ganar tokens!',
      videoWatched: 'Video visto'
    },
    
    // Pantalla de Conversión
    convert: {
      title: 'Convertir Tokens',
      rate: '1000 $VIDEO = 1 WLD',
      availableBalance: 'Balance Disponible',
      videoTokens: '$VIDEO Tokens',
      amountToConvert: 'Cantidad a Convertir',
      enterAmount: 'Ingresá cantidad de $VIDEO',
      max: 'Máx',
      youWillReceive: 'Vas a recibir',
      convertButton: 'Convertir a WLD',
      converting: 'Convirtiendo...',
      minimum: 'Conversión mínima: 5000 $VIDEO tokens',
      conversionsStartDate: 'Las conversiones comenzarán en junio de 2026',
      history: 'Historial de Conversiones',
      noConversions: 'Sin conversiones todavía',
      convertFirst: '¡Convertí tus primeros tokens arriba!',
      confirmationMsg: 'Vas a recibir {amount} WLD dentro de 24 horas',
      successMsg: '¡Convertiste exitosamente {video} $VIDEO a {wld} WLD!',
      errorMinimum: 'La conversión mínima es 5000 $VIDEO tokens',
      errorInsufficient: '$VIDEO tokens insuficientes',
      errorFailed: 'La conversión falló. Intentá de nuevo.',
      comingSoon: '🚀 ¡Conversiones disponibles en junio 2026! Seguí ganando $VIDEO — ¡canjealo por WLD pronto!'
    },
    
    // Tareas
    tasks: {
      dailyLogin: 'Bonus de Ingreso Diario',
      followX: 'Seguí a VidLook en X',
      postX: 'Publicá sobre VidLook en X',
      watch1Hour: 'Mirá 1 Hora en Total'
    },
    
    // Navegación
    nav: {
      home: 'Inicio',
      convert: 'Convertir',
      profile: 'Perfil'
    },
    
    // Pantalla de Error
    error: {
      title: 'Se requiere World App',
      message: 'VidLook solo puede abrirse dentro de World App. Por favor abrí esta mini app desde World App para continuar.',
      downloadTitle: '¿No tenés World App?',
      downloadButton: 'Descargar World App'
    }
  },
  
  th: {
    // หน้าต้อนรับ
    welcome: {
      tagline: 'ดู YouTube และรับ WLD',
      feature1Title: 'ดูวิดีโอยอดนิยม',
      feature1Desc: 'ค้นพบเนื้อหาที่กำลังมาแรง',
      feature2Title: 'รับ $VIDEO Tokens',
      feature2Desc: '2 $VIDEO ต่อนาทีที่รับชม',
      feature3Title: 'แลกเป็น WLD',
      feature3Desc: '1000 $VIDEO = 1 WLD',
      connectWallet: 'เชื่อมต่อกระเป๋า',
      connecting: 'กำลังเชื่อมต่อ...',
      selectLanguage: 'เลือกภาษา'
    },
    
    // หน้าหลัก
    home: {
      searchPlaceholder: 'ค้นหาวิดีโอ...',
      resultsFor: '{count} ผลลัพธ์สำหรับ "{query}"',
      clear: 'ล้าง',
      trendingIn: 'กำลังมาแรงใน{country}',
      yourRegion: 'ภูมิภาคของคุณ',
      sponsored: 'สปอนเซอร์',
      sponsoredEarn: 'รับ 5 $VIDEO ต่อนาที',
      earning: 'กำลังรับ $VIDEO'
    },
    
    // หน้าโปรไฟล์
    profile: {
      logout: 'ออกจากระบบ',
      videoBalance: 'ยอดคงเหลือ $VIDEO',
      watchTime: 'เวลาที่รับชม',
      totalEarned: 'รายได้ทั้งหมด',
      joined: 'เข้าร่วมเมื่อ',
      tasksRewards: 'ภารกิจและรางวัล',
      claim: 'รับรางวัล',
      faq: 'คำถามที่พบบ่อย',
      faq1Question: 'ติดต่อทีม VidLook ได้อย่างไร?',
      faq1Answer: 'เยี่ยมชม:',
      faq2Question: 'เมื่อไหร่จะได้รับ WLDs ที่แลก?',
      faq2Answer: 'WLDs จะถูกส่งตรงไปยังกระเป๋าของคุณภายใน 24 ชั่วโมง',
      faq3Question: 'อัตราการรับรายได้จากวิดีโอเป็นเท่าไหร่?',
      faq3Answer: 'วิดีโอสปอนเซอร์: 5 $VIDEO ต่อนาที วิดีโอทั่วไป: 2 $VIDEO ต่อนาที',
      faq4Question: 'VidLook สร้างรายได้อย่างไร?',
      faq4Answer: 'VidLook สร้างรายได้จากโฆษณาของบุคคลที่สามที่แสดงระหว่างวิดีโอ และแบ่งปันส่วนหนึ่งของรายได้โฆษณานั้นให้กับผู้ใช้ผ่านโทเคน $VIDEO ยิ่งดูมาก เรายิ่งได้รับด้วยกันมาก - ง่ายแค่นี้!',
      recentActivity: 'กิจกรรมล่าสุด',
      noHistory: 'ยังไม่มีประวัติการรับชม',
      startWatching: 'เริ่มดูเพื่อรับ tokens!',
      videoWatched: 'ดูวิดีโอแล้ว'
    },
    
    // หน้าแลกเปลี่ยน
    convert: {
      title: 'แลกเปลี่ยน Tokens',
      rate: '1000 $VIDEO = 1 WLD',
      availableBalance: 'ยอดคงเหลือ',
      videoTokens: '$VIDEO Tokens',
      amountToConvert: 'จำนวนที่ต้องการแลก',
      enterAmount: 'ใส่จำนวน $VIDEO',
      max: 'สูงสุด',
      youWillReceive: 'คุณจะได้รับ',
      convertButton: 'แลกเป็น WLD',
      converting: 'กำลังแลก...',
      minimum: 'แลกขั้นต่ำ: 5000 $VIDEO tokens',
      conversionsStartDate: 'การแลกเปลี่ยนจะเริ่มในเดือนมิถุนายน 2026',
      history: 'ประวัติการแลก',
      noConversions: 'ยังไม่มีการแลกเปลี่ยน',
      convertFirst: 'แลก tokens แรกของคุณด้านบน!',
      confirmationMsg: 'คุณจะได้รับ {amount} WLD ภายใน 24 ชั่วโมง',
      successMsg: 'แลกสำเร็จ {video} $VIDEO เป็น {wld} WLD!',
      errorMinimum: 'การแลกขั้นต่ำคือ 5000 $VIDEO tokens',
      errorInsufficient: '$VIDEO tokens ไม่เพียงพอ',
      errorFailed: 'การแลกล้มเหลว กรุณาลองใหม่',
      comingSoon: '🚀 เปิดแลกเปลี่ยนมิถุนายน 2026! สะสม $VIDEO ต่อไป — แลกเป็น WLD ได้เร็วๆ นี้!'
    },
    
    // ภารกิจ
    tasks: {
      dailyLogin: 'โบนัสเข้าสู่ระบบรายวัน',
      followX: 'ติดตาม VidLook บน X',
      postX: 'โพสต์เกี่ยวกับ VidLook บน X',
      watch1Hour: 'รับชมครบ 1 ชั่วโมง'
    },
    
    // การนำทาง
    nav: {
      home: 'หน้าแรก',
      convert: 'แลก',
      profile: 'โปรไฟล์'
    },
    
    // หน้าข้อผิดพลาด
    error: {
      title: 'ต้องการ World App',
      message: 'VidLook สามารถเปิดได้เฉพาะใน World App เท่านั้น กรุณาเปิดมินิแอปนี้จาก World App เพื่อดำเนินการต่อ',
      downloadTitle: 'ยังไม่มี World App?',
      downloadButton: 'ดาวน์โหลด World App'
    }
  },

  ja: {
    // ようこそ画面
    welcome: {
      tagline: 'YouTubeを見てWLDを稼ごう',
      feature1Title: 'トレンド動画を視聴',
      feature1Desc: '人気コンテンツを発見',
      feature2Title: '$VIDEOトークンを獲得',
      feature2Desc: '視聴1分につき2 $VIDEO',
      feature3Title: 'WLDに交換',
      feature3Desc: '1000 $VIDEO = 1 WLD',
      connectWallet: 'ウォレットを接続',
      connecting: '接続中...',
      selectLanguage: '言語を選択'
    },
    
    // ホーム画面
    home: {
      searchPlaceholder: '動画を検索...',
      resultsFor: '「{query}」の検索結果 {count}件',
      clear: 'クリア',
      trendingIn: '{country}で人気',
      yourRegion: 'あなたの地域',
      sponsored: 'スポンサー',
      sponsoredEarn: '1分につき5 $VIDEO獲得',
      earning: '$VIDEO獲得中'
    },
    
    // プロフィール画面
    profile: {
      logout: 'ログアウト',
      videoBalance: '$VIDEO残高',
      watchTime: '視聴時間',
      totalEarned: '総獲得額',
      joined: '登録日',
      tasksRewards: 'タスクとリワード',
      claim: '受け取る',
      faq: 'よくある質問',
      faq1Question: 'VidLookチームに連絡するには?',
      faq1Answer: 'こちらへ:',
      faq2Question: '交換したWLDはいつ届きますか?',
      faq2Answer: 'WLDは交換後24時間以内にウォレットに送金されます。',
      faq3Question: '動画の報酬レートは?',
      faq3Answer: 'スポンサー動画: 1分5 $VIDEO。通常動画: 1分2 $VIDEO。',
      faq4Question: 'VidLookはどうやって収益を得ていますか?',
      faq4Answer: 'VidLookは動画間に表示されるサードパーティ広告から収益を得て、その広告収益の一部を$VIDEOトークンとしてユーザーに還元しています。視聴すればするほど、一緒に稼げます - シンプルです！',
      recentActivity: '最近のアクティビティ',
      noHistory: '視聴履歴がありません',
      startWatching: '視聴を開始してトークンを獲得しよう！',
      videoWatched: '動画を視聴しました'
    },
    
    // 交換画面
    convert: {
      title: 'トークンを交換',
      rate: '1000 $VIDEO = 1 WLD',
      availableBalance: '利用可能残高',
      videoTokens: '$VIDEOトークン',
      amountToConvert: '交換する金額',
      enterAmount: '$VIDEO金額を入力',
      max: '最大',
      youWillReceive: '受け取り額',
      convertButton: 'WLDに交換',
      converting: '交換中...',
      minimum: '最低交換額: 5000 $VIDEOトークン',
      conversionsStartDate: '交換は2026年6月に開始予定',
      history: '交換履歴',
      noConversions: 'まだ交換履歴がありません',
      convertFirst: '上から最初のトークンを交換しよう！',
      confirmationMsg: '24時間以内に{amount} WLDを受け取れます',
      successMsg: '{video} $VIDEOを{wld} WLDに交換しました！',
      errorMinimum: '最低交換額は5000 $VIDEOトークンです',
      errorInsufficient: '$VIDEOトークンが不足しています',
      errorFailed: '交換に失敗しました。もう一度お試しください。',
      comingSoon: '🚀 2026年6月に交換開始！$VIDEOを貯め続けよう — まもなくWLDに交換できます！'
    },
    
    // タスク
    tasks: {
      dailyLogin: 'デイリーログインボーナス',
      followX: 'XでVidLookをフォロー',
      postX: 'XでVidLookについて投稿',
      watch1Hour: '合計1時間視聴'
    },
    
    // ナビゲーション
    nav: {
      home: 'ホーム',
      convert: '交換',
      profile: 'プロフィール'
    },
    
    // エラー画面
    error: {
      title: 'World Appが必要です',
      message: 'VidLookはWorld App内でのみ開けます。続行するにはWorld Appからこのミニアプリを開いてください。',
      downloadTitle: 'World Appをお持ちでないですか?',
      downloadButton: 'World Appをダウンロード'
    }
  }
};

// Helper function to get translation
export function t(lang, section, key) {
  return translations[lang]?.[section]?.[key] || translations['en']?.[section]?.[key] || key;
}

// Helper to get language from country code
export function getLanguageFromCountry(countryCode) {
  return COUNTRY_TO_LANGUAGE[countryCode] || 'en';
}
