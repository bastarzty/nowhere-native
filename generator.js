document.addEventListener('DOMContentLoaded', function() {
  // 表单和输出DOM元素
  const form = document.getElementById('identity-form');
  const outputContainer = document.getElementById('monologue-output');
  const outputText = outputContainer.querySelector('.output-text');
  const actions = outputContainer.querySelector('.actions');
  const regenerateBtn = document.getElementById('regenerate-btn');
  const saveBtn = document.getElementById('save-btn');
  
  // 添加语言选择下拉菜单
  const languageSelector = document.createElement('select');
  languageSelector.id = 'output-language';
  languageSelector.innerHTML = `
    <option value="original">Original</option>
    <option value="chinese">中文</option>
    <option value="english">English</option>
    <option value="korean">한국어</option>
    <option value="japanese">日本語</option>
    <option value="french">Français</option>
    <option value="spanish">Español</option>
  `;
  
  // 在适当的位置插入语言选择器
  const selectorContainer = document.getElementById('language-selector-container');
  if (selectorContainer) {
    selectorContainer.appendChild(languageSelector);
  } else {
    console.error('找不到语言选择器容器！');
    actions.insertBefore(languageSelector, saveBtn);
  }
  
  // 语言选择事件
  languageSelector.addEventListener('change', function() {
    if (userData && currentMonologue) {
      translateMonologue(currentMonologue, this.value);
    }
  });
  
  // 数据存储 - 内联数据，解决本地文件访问问题
  // 短语数据
  const phrasesData = {
    "templates": {
      "intro": [
        "They call me \"{foreignName}\" at school, but my {relative} still whispers \"{localName}\".",
        "In {placeWestern}, I am {foreignName}; in {placeNative}, I am {localName}.",
        "My {relative} says my name is {localName}, but my friends only know me as {foreignName}.",
        "My ID card says {foreignName}, but my heart answers to {localName}."
      ],
      "memory": [
        "I've forgotten how to write my name in my mother tongue,\nbut I remember the taste of {foodMemory} every {dayOfWeek}.",
        "I can't remember how to say \"{phraseForgotten}\" anymore,\nbut the aroma of {foodMemory} still reminds me of home.",
        "Sometimes I forget how to say {phraseForgotten},\nbut the taste of {foodMemory} never fades from my memory.",
        "My tongue has forgotten the tones of {nativeLanguage},\nbut my stomach still remembers the warmth of {foodMemory}."
      ],
      "belonging": [
        "I belong to a city that never truly knew me,\nand to a family that forgot how to explain who I've become.",
        "My roots are planted in {placeNative} soil,\nyet I breathe the air of {placeWestern}.",
        "I stand on {placeWestern} streets like a tourist,\nand in my {placeNative} home like a stranger.",
        "When I'm in {placeWestern}, I miss {placeNative};\nwhen I'm in {placeNative}, I long for {placeWestern}."
      ],
      "language": [
        "Some nights I dream in {foreignLanguage},\nand apologize in {nativeLanguage}.",
        "My thoughts jump between {foreignLanguage} and {nativeLanguage},\nnever fully expressing myself in either one.",
        "My jokes lose their soul in {foreignLanguage},\nmy emotions can't find words in {nativeLanguage}.",
        "I think in {foreignLanguage},\nand cry in {nativeLanguage}."
      ],
      "question": [
        "Who am I?\nYou tell me.",
        "Where is my home?\nProbably not on any map.",
        "Where do I belong?\nPerhaps everywhere, or nowhere at all.",
        "Where does my story begin?\nWith flight numbers and visa dates."
      ]
    },
    "relatives": [
      "grandmother", "grandfather", "mother", "father", "aunt", "uncle", "cousin", "sister", "brother"
    ],
    "dayOfWeek": [
      "Sunday", "weekend", "holiday", "Saturday", "family gathering"
    ],
    "phrasesForgotten": [
      "I miss you", "I'm sorry", "I love you", "thank you", "goodbye", "welcome home", "good night", "blessings"
    ],
    "feelings": {
      "lost": {
        "tone": "lost",
        "phrases": [
          "I'm like an island drifting between two worlds.",
          "I am the forgotten translator, forever in the middle ground.",
          "My roots have loosened, with nowhere to replant."
        ]
      },
      "proud": {
        "tone": "proud",
        "phrases": [
          "I am a bridge between two worlds, a holder of dual perspectives.",
          "I walk along borders, yet possess a broader sky.",
          "My identity is a mosaic, made of multiple colors."
        ]
      },
      "conflicted": {
        "tone": "conflicted",
        "phrases": [
          "My soul is torn in two, never to be whole.",
          "I stand at the crossroads, not knowing which path to take.",
          "I simultaneously long to blend in and to stand out."
        ]
      },
      "nostalgic": {
        "tone": "nostalgic",
        "phrases": [
          "I long for a home that may have never truly existed.",
          "I collect fragments of memories, trying to piece together my past.",
          "My childhood is a book written in two languages."
        ]
      },
      "alienated": {
        "tone": "alienated",
        "phrases": [
          "I am forever the outsider, no matter where I go.",
          "I wear an invisibility cloak, pretending I belong.",
          "I've learned to mimic, but forgotten how to be my authentic self."
        ]
      }
    }
  };

  // 地点数据
  const placesData = {
    "east-asia": {
      "places": [
        "Beijing", "Shanghai", "Taipei", "Hong Kong", "Seoul", "Tokyo", "Osaka", "Xi'an",
        "Nanjing", "Hangzhou", "Chongqing", "Guangzhou", "Busan", "Kyoto", "Taichung"
      ]
    },
    "western": {
      "places": [
        "New York", "Los Angeles", "London", "Paris", "Berlin", "Sydney", "Vancouver", "Toronto",
        "San Francisco", "Chicago", "Boston", "Seattle", "Melbourne", "Amsterdam", "Rome"
      ]
    },
    "southeast-asia": {
      "places": [
        "Bangkok", "Singapore", "Manila", "Kuala Lumpur", "Hanoi", "Jakarta", "Ho Chi Minh City",
        "Penang", "Chiang Mai", "Phuket", "Pattaya", "Bali"
      ]
    },
    "south-asia": {
      "places": [
        "Mumbai", "Delhi", "Kolkata", "Karachi", "Bangalore", "Colombo", "Dhaka",
        "Kathmandu", "Jaipur", "Agra", "Varanasi"
      ]
    },
    "middle-east": {
      "places": [
        "Dubai", "Istanbul", "Cairo", "Tehran", "Riyadh", "Jerusalem", "Amman",
        "Beirut", "Doha", "Baghdad", "Abu Dhabi"
      ]
    },
    "africa": {
      "places": [
        "Cape Town", "Nairobi", "Lagos", "Cairo", "Casablanca", "Addis Ababa",
        "Dakar", "Johannesburg", "Tunis", "Accra", "Mombasa"
      ]
    },
    "latin-america": {
      "places": [
        "Mexico City", "Buenos Aires", "Rio de Janeiro", "Lima", "Bogotá", "Santiago",
        "São Paulo", "Havana", "Cartagena", "Monterrey", "Cusco"
      ]
    }
  };

  // 语言数据
  const languagesData = {
    "chinese": {
      "name": "Chinese"
    },
    "english": {
      "name": "English"
    },
    "korean": {
      "name": "Korean"
    },
    "japanese": {
      "name": "Japanese"
    },
    "french": {
      "name": "French"
    },
    "spanish": {
      "name": "Spanish"
    },
    "arabic": {
      "name": "Arabic"
    },
    "hindi": {
      "name": "Hindi"
    },
    "other": {
      "name": "another language"
    }
  };
  
  let userData = null;
  let currentMonologue = null; // 存储当前生成的独白
  
  // 表单提交处理
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    console.log('表单已提交，正在收集数据...');
    
    try {
      userData = collectUserData();
      console.log('用户数据:', userData);
      
      if (!userData) {
        throw new Error('用户数据收集失败');
      }
      
      generateMonologue();
    } catch (error) {
      console.error('生成独白时出错:', error);
      
      // 显示错误信息
      outputContainer.style.display = 'flex';
      outputText.innerHTML = '很抱歉，生成独白时出现错误。请重新尝试。<br>Error generating monologue. Please try again.';
    }
  });
  
  // 重新生成按钮
  regenerateBtn.addEventListener('click', function() {
    generateMonologue();
  });
  
  // 保存为图片按钮
  saveBtn.addEventListener('click', function() {
    saveAsImage();
  });
  
  // 收集用户输入数据
  function collectUserData() {
    console.log('开始收集用户数据...');
    try {
      const nameLocal = document.getElementById('name-local').value;
      const nameForeign = document.getElementById('name-foreign').value;
      const nativeLanguage = document.getElementById('native-language').value;
      const food = document.getElementById('food').value;
      
      console.log('基本信息收集完成:', { nameLocal, nameForeign, nativeLanguage, food });
      
      // 收集所有选中的语言
      const languages = [];
      document.querySelectorAll('input[name="language"]:checked').forEach(checkbox => {
        languages.push(checkbox.value);
      });
      
      console.log('选中的语言:', languages);
      
      // 确保至少有一种语言被选中
      if (languages.length === 0) {
        console.log('没有选择语言，使用默认语言');
        if (nativeLanguage) {
          languages.push(nativeLanguage);
        } else {
          languages.push('english');
        }
      }
      
      // 收集文化背景
      const culturalBackgrounds = [];
      document.querySelectorAll('input[name="cultural-bg"]:checked').forEach(checkbox => {
        culturalBackgrounds.push(checkbox.value);
      });
      
      console.log('选中的文化背景:', culturalBackgrounds);
      
      const feeling = document.querySelector('input[name="feeling"]:checked').value;
      console.log('选中的感受:', feeling);
      
      return {
        nameLocal,
        nameForeign,
        nativeLanguage,
        languages,
        food,
        culturalBackgrounds,
        feeling
      };
    } catch (error) {
      console.error('收集用户数据时出错:', error);
      return null;
    }
  }
  
  // 随机选择数组中的一个元素
  function randomChoice(array) {
    return array[Math.floor(Math.random() * array.length)];
  }
  
  // 获取用户选择的文化背景的地点
  function getPlacesForUser() {
    const nativePlaces = [];
    const westernPlaces = [];
    
    // 确保至少有一个文化背景
    if (userData.culturalBackgrounds.length === 0) {
      userData.culturalBackgrounds.push('east-asia');
    }
    
    // 获取用户选择的本土地点
    userData.culturalBackgrounds.forEach(bg => {
      if (bg !== 'western' && placesData[bg]) {
        nativePlaces.push(...placesData[bg].places);
      }
    });
    
    // 如果用户选择了西方文化背景或者需要对比
    if (userData.culturalBackgrounds.includes('western')) {
      westernPlaces.push(...placesData.western.places);
    } else {
      westernPlaces.push(...placesData.western.places);
    }
    
    return {
      native: nativePlaces.length > 0 ? nativePlaces : placesData['east-asia'].places,
      western: westernPlaces
    };
  }
  
  // 替换模板中的变量
  function replaceTemplateVariables(template) {
    const userPlaces = getPlacesForUser();
    
    // 语言处理
    let nativeLanguageName = languagesData[userData.nativeLanguage] ? 
                            languagesData[userData.nativeLanguage].name : 
                            languagesData.english.name;
    
    // 为外语选择一个不同于母语的语言
    let foreignLanguages = userData.languages.filter(lang => lang !== userData.nativeLanguage);
    let foreignLanguage = foreignLanguages.length > 0 ? randomChoice(foreignLanguages) : 'english';
    let foreignLanguageName = languagesData[foreignLanguage] ? 
                             languagesData[foreignLanguage].name : 
                             languagesData.english.name;
    
    return template
      .replace(/{localName}/g, userData.nameLocal)
      .replace(/{foreignName}/g, userData.nameForeign)
      .replace(/{relative}/g, randomChoice(phrasesData.relatives))
      .replace(/{dayOfWeek}/g, randomChoice(phrasesData.dayOfWeek))
      .replace(/{foodMemory}/g, userData.food)
      .replace(/{phraseForgotten}/g, randomChoice(phrasesData.phrasesForgotten))
      .replace(/{placeNative}/g, randomChoice(userPlaces.native))
      .replace(/{placeWestern}/g, randomChoice(userPlaces.western))
      .replace(/{nativeLanguage}/g, nativeLanguageName)
      .replace(/{foreignLanguage}/g, foreignLanguageName);
  }
  
  // 生成完整的身份独白
  function generateMonologue() {
    console.log('开始生成独白...');
    if (!userData) {
      console.error('错误: userData为空!');
      return;
    }
    
    // 显示输出区域和动作按钮
    outputContainer.style.display = 'flex';
    actions.classList.remove('hidden');
    
    console.log('输出容器:', outputContainer);
    console.log('动作按钮:', actions);
    
    // 清空之前的内容
    outputText.innerHTML = '';
    
    // 创建独白文本段落
    const monologue = [];
    
    // 添加介绍句
    monologue.push(replaceTemplateVariables(randomChoice(phrasesData.templates.intro)));
    
    // 添加记忆句
    monologue.push(replaceTemplateVariables(randomChoice(phrasesData.templates.memory)));
    
    // 添加归属感句
    monologue.push(replaceTemplateVariables(randomChoice(phrasesData.templates.belonging)));
    
    // 添加语言句
    monologue.push(replaceTemplateVariables(randomChoice(phrasesData.templates.language)));
    
    // 添加基于感受的特定短语
    if (phrasesData.feelings[userData.feeling]) {
      const feelingPhrase = randomChoice(phrasesData.feelings[userData.feeling].phrases);
      monologue.push(feelingPhrase);
    }
    
    // 添加问题结尾
    monologue.push(replaceTemplateVariables(randomChoice(phrasesData.templates.question)));
    
    // 保存当前生成的独白
    currentMonologue = monologue.join('\n\n');
    
    // 重置语言选择器
    document.getElementById('output-language').value = 'original';
    
    // 使用打字机效果显示内容
    typewriterEffect(currentMonologue);
  }
  
  // 打字机效果函数
  function typewriterEffect(text) {
    console.log('开始打字机效果，文本长度:', text.length);
    console.log('文本开头部分:', text.substring(0, 50));
    
    // 如果文本为空，显示错误信息
    if (!text || text.length === 0) {
      console.error('打字机效果收到空文本');
      outputText.innerHTML = '生成独白失败。请重试。<br>Failed to generate monologue. Please try again.';
      return;
    }
    
    // 直接显示文本（备用方案）
    if (text.length > 1000) {
      console.log('文本过长，直接显示而不使用打字机效果');
      outputText.innerHTML = text;
      return;
    }
    
    // 打字机效果实现
    let i = 0;
    const speed = 40; // 打印速度（毫秒/字符）
    outputText.innerHTML = ''; // 确保开始前清空
    
    function type() {
      if (i < text.length) {
        outputText.innerHTML += text.charAt(i);
        i++;
        
        // 确保自动滚动到底部
        outputContainer.scrollTop = outputContainer.scrollHeight;
        
        // 调整打字速度（标点符号处放慢）
        const nextChar = text.charAt(i);
        let delay = speed;
        if (nextChar === '。' || nextChar === '，' || nextChar === '.' || nextChar === ',') {
          delay = speed * 3;
        } else if (nextChar === '\n') {
          delay = speed * 5;
        }
        
        setTimeout(type, delay);
      } else {
        console.log('打字机效果完成');
      }
    }
    
    // 开始打字机效果
    try {
      type();
    } catch (error) {
      console.error('打字机效果执行出错:', error);
      // 如果打字机效果失败，直接显示文本
      outputText.innerHTML = text;
    }
  }
  
  // 保存为图片函数
  function saveAsImage() {
    // 添加html2canvas脚本
    if (typeof html2canvas === 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://html2canvas.hertzen.com/dist/html2canvas.min.js';
      script.onload = function() {
        captureAndSave();
      };
      document.head.appendChild(script);
    } else {
      captureAndSave();
    }
    
    function captureAndSave() {
      html2canvas(outputText, {
        backgroundColor: '#121212',
        scale: 2 // 提高清晰度
      }).then(canvas => {
        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = 'nowhere-native-identity.png';
        link.href = dataUrl;
        link.click();
      }).catch(err => {
        console.error('Failed to save image:', err);
        // 退化方案：复制文本
        const text = outputText.innerText;
        navigator.clipboard.writeText(text).then(() => {
          alert('Text content copied to clipboard instead');
        });
      });
    }
  }
  
  // 添加翻译功能
  async function translateMonologue(text, targetLanguage) {
    console.log(`开始翻译成 ${targetLanguage} 语言`);
    
    if (targetLanguage === 'original') {
      console.log('使用原始文本，不翻译');
      typewriterEffect(text);
      return;
    }
    
    // 显示加载状态
    outputText.innerHTML = '翻译中...<br>Translating...';
    
    try {
      // 使用免费的翻译API或内置的翻译函数
      let translatedText;
      
      // 简单的演示翻译函数
      switch(targetLanguage) {
        case 'chinese':
          translatedText = await translateToChinese(text);
          break;
        case 'korean':
          translatedText = await translateToKorean(text);
          break;
        case 'japanese':
          translatedText = await translateToJapanese(text);
          break;
        case 'french':
          translatedText = await translateToFrench(text);
          break;
        case 'spanish':
          translatedText = await translateToSpanish(text);
          break;
        case 'english':
        default:
          translatedText = await translateToEnglish(text);
          break;
      }
      
      console.log(`翻译完成，结果长度: ${translatedText.length}`);
      console.log('翻译结果开头:', translatedText.substring(0, 50));
      
      // 显示翻译后的文本
      typewriterEffect(translatedText);
    } catch (error) {
      console.error('翻译出错:', error);
      outputText.innerHTML = '翻译失败。请重试。<br>Translation failed. Please try again.';
    }
  }
  
  // 模拟翻译函数（实际应用中可以替换为API调用）
  async function translateToChinese(text) {
    // 这里可以接入真实的翻译API，如Google Translate、百度翻译等
    // 以下为简单的硬编码翻译示例
    const patterns = {
      "They call me": "他们叫我",
      "at school": "在学校",
      "but my": "但我的",
      "still whispers": "仍然轻声呼唤",
      "In": "在",
      "I am": "我是",
      "My": "我的",
      "says my name is": "说我的名字是",
      "but my friends only know me as": "但我的朋友们只认识我为",
      "ID card says": "身份证上写着",
      "but my heart answers to": "但我的心回应的是",
      "I've forgotten how to write my name in my mother tongue": "我已经忘了如何用母语书写我的名字",
      "but I remember the taste of": "但我记得",
      "every": "每",
      "aroma of": "的香气",
      "still reminds me of home": "仍然让我想起家",
      "Sometimes I forget how to say": "有时我忘记如何说",
      "anymore": "了",
      "taste of": "的味道",
      "never fades from my memory": "从未从我的记忆中消失",
      "My tongue has forgotten the tones of": "我的舌头已经忘记了",
      "but my stomach still remembers the warmth of": "但我的胃仍然记得",
      "I belong to a city that never truly knew me": "我属于一个从未真正了解我的城市",
      "and to a family that forgot how to explain who I've become": "和一个忘记如何解释我变成什么样的家庭",
      "My roots are planted in": "我的根扎在",
      "soil": "的土壤中",
      "yet I breathe the air of": "但我呼吸着",
      "的空气",
      "I stand on": "我站在",
      "streets like a tourist": "的街道上像个游客",
      "home like a stranger": "的家中像个陌生人",
      "When I'm in": "当我在",
      "I miss": "我想念",
      "when I'm in": "当我在",
      "I long for": "我渴望",
      "Some nights I dream in": "有些夜晚我用",
      "and apologize in": "做梦，用",
      "道歉",
      "My thoughts jump between": "我的思绪在",
      "never fully expressing myself in either one": "之间跳跃，从未能用任何一种语言充分表达自己",
      "My jokes lose their soul in": "我的笑话在",
      "中失去了灵魂",
      "my emotions can't find words in": "我的情感在",
      "中找不到言语",
      "I think in": "我用",
      "思考",
      "and cry in": "用",
      "哭泣",
      "Who am I?": "我是谁？",
      "You tell me.": "你告诉我。",
      "Where is my home?": "我的家在哪里？",
      "Probably not on any map.": "可能不在任何地图上。",
      "Where do I belong?": "我属于哪里？",
      "Perhaps everywhere, or nowhere at all.": "也许到处都是，或者哪里都不是。",
      "Where does my story begin?": "我的故事从哪里开始？",
      "With flight numbers and visa dates.": "从航班号和签证日期开始。",
      "I'm like an island drifting between two worlds.": "我像一座漂流在两个世界之间的孤岛。",
      "I am the forgotten translator, forever in the middle ground.": "我是被遗忘的翻译者，永远站在中间地带。",
      "My roots have loosened, with nowhere to replant.": "我的根已经松动，无处可以重新栽种。",
      "I am a bridge between two worlds, a holder of dual perspectives.": "我是连接两个世界的桥梁，双重视角的持有者。",
      "I walk along borders, yet possess a broader sky.": "我沿着边界行走，却拥有更广阔的天空。",
      "My identity is a mosaic, made of multiple colors.": "我的身份是一幅马赛克，由多种颜色组成。",
      "My soul is torn in two, never to be whole.": "我的灵魂被撕成两半，永远无法完整。",
      "I stand at the crossroads, not knowing which path to take.": "我站在十字路口，不知道该走哪条路。",
      "I simultaneously long to blend in and to stand out.": "我同时渴望融入又渴望与众不同。",
      "I long for a home that may have never truly existed.": "我渴望一个可能从未真正存在过的家。",
      "I collect fragments of memories, trying to piece together my past.": "我收集记忆的碎片，试图拼凑我的过去。",
      "My childhood is a book written in two languages.": "我的童年是一本用两种语言写成的书。",
      "I am forever the outsider, no matter where I go.": "无论我去哪里，我永远是局外人。",
      "I wear an invisibility cloak, pretending I belong.": "我披着隐形斗篷，假装我属于这里。",
      "I've learned to mimic, but forgotten how to be my authentic self.": "我已学会模仿，却忘记了如何做真实的自己。"
    };
    
    // 简单替换翻译
    let translatedText = text;
    for (const [english, chinese] of Object.entries(patterns)) {
      translatedText = translatedText.replace(new RegExp(english, 'g'), chinese);
    }
    
    // 等待一些时间，模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return translatedText;
  }
  
  async function translateToEnglish(text) {
    // 英语版本就是原始文本
    await new Promise(resolve => setTimeout(resolve, 500));
    return text;
  }
  
  async function translateToKorean(text) {
    // 简化的韩语翻译示例
    const koreanText = text
      .replace(/I am/g, "나는")
      .replace(/My/g, "내")
      .replace(/Who am I\?/g, "나는 누구인가?")
      .replace(/You tell me./g, "네가 말해줘.")
      .replace(/Where is my home\?/g, "내 집은 어디인가?")
      .replace(/Probably not on any map./g, "아마도 어떤 지도에도 없을 거야.");
      
    await new Promise(resolve => setTimeout(resolve, 800));
    return koreanText;
  }
  
  async function translateToJapanese(text) {
    // 简化的日语翻译示例
    const japaneseText = text
      .replace(/I am/g, "私は")
      .replace(/My/g, "私の")
      .replace(/Who am I\?/g, "私は誰ですか？")
      .replace(/You tell me./g, "あなたが教えてください。")
      .replace(/Where is my home\?/g, "私の家はどこですか？")
      .replace(/Probably not on any map./g, "おそらくどの地図にも載っていないでしょう。");
      
    await new Promise(resolve => setTimeout(resolve, 800));
    return japaneseText;
  }
  
  async function translateToFrench(text) {
    // 简化的法语翻译示例
    const frenchText = text
      .replace(/I am/g, "Je suis")
      .replace(/My/g, "Mon")
      .replace(/Who am I\?/g, "Qui suis-je?")
      .replace(/You tell me./g, "Dites-moi.")
      .replace(/Where is my home\?/g, "Où est ma maison?")
      .replace(/Probably not on any map./g, "Probablement sur aucune carte.");
      
    await new Promise(resolve => setTimeout(resolve, 800));
    return frenchText;
  }
  
  async function translateToSpanish(text) {
    // 简化的西班牙语翻译示例
    const spanishText = text
      .replace(/I am/g, "Yo soy")
      .replace(/My/g, "Mi")
      .replace(/Who am I\?/g, "¿Quién soy yo?")
      .replace(/You tell me./g, "Dímelo tú.")
      .replace(/Where is my home\?/g, "¿Dónde está mi hogar?")
      .replace(/Probably not on any map./g, "Probablemente en ningún mapa.");
      
    await new Promise(resolve => setTimeout(resolve, 800));
    return spanishText;
  }
  
  // 为演示添加console消息
  console.log('Identity monologue generator loaded, please fill the form to generate your monologue');
}); 