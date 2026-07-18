/* ============================================================
   Bilingual content for Wen Chen's homepage.
   Edit text here; app.js renders it. {en, zh} pairs throughout.
   Author names "Wen Chen" / "陈稳" are auto-bolded by app.js.
   ============================================================ */
window.SITE = {

  ui: {
    nav: [
      { id: "home",         en: "About",        zh: "简介" },
      { id: "research",     en: "Research",     zh: "研究" },
      { id: "publications", en: "Publications", zh: "论文" },
      { id: "projects",     en: "Projects",     zh: "项目" },
      { id: "experience",   en: "Experience",   zh: "经历" },
      { id: "outreach",     en: "Outreach",     zh: "科普" }
    ],
    newsTitle:   { en: "News",            zh: "近期动态" },
    cv:          { en: "Curriculum Vitae", zh: "个人简历" },
    selected:    { en: "Selected",        zh: "代表性论文" },
    all:         { en: "All Publications", zh: "全部论文" },
    sec: {
      research:     { en: "Research",                 zh: "研究方向" },
      publications: { en: "Publications",             zh: "学术论文" },
      projects:     { en: "Projects",                 zh: "代表性项目" },
      experience:   { en: "Education & Experience",   zh: "教育与经历" },
      outreach:     { en: "Science Outreach",         zh: "科学传播" },
      awards:       { en: "Awards & Service",         zh: "荣誉与活动" }
    },
    eduTitle:  { en: "Education",  zh: "教育背景" },
    workTitle: { en: "Experience", zh: "研究经历" },
    footnote:  { en: "Built with the academic web in mind · Bilingual",
                 zh: "面向学术展示而设计 · 中英双语" }
  },

  profile: {
    name:  "Wen Chen",
    nameZh: "陈稳",
    alias: "Wayne",
    role:  {
      en: "Research Assistant · <b>The Future Laboratory</b>, Tsinghua University",
      zh: "科研助理 · 清华大学 <b>未来实验室</b>"
    },
    info: {
      affiliation: {
        en: "The Future Laboratory<br>Tsinghua University",
        zh: "清华大学 未来实验室<br>人机物融合及前沿探索中心"
      },
      location: { en: "Beijing, China", zh: "中国 · 北京" },
      email: "chenwen_bot@mail.tsinghua.edu.cn"
    },
    links: [
      { label: { en: "Google Scholar", zh: "谷歌学术" }, url: "https://scholar.google.com/citations?user=8KDUC5oAAAAJ&hl=en" },
      { label: { en: "GitHub", zh: "GitHub" }, url: "https://github.com/WayneUSC" },
      { label: { en: "Lab", zh: "实验室主页" }, url: "https://thfl.tsinghua.edu.cn" },
      { label: { en: "Bilibili", zh: "哔哩哔哩" }, url: "https://space.bilibili.com/3546599376554433?spm_id_from=333.337.0.0" }
    ]
  },

  intro: {
    eyebrow: { en: "Dynamic Tactile Sensing · Embodied Social Intelligence", zh: "动态触觉感知 · 具身社会智能" },
    paras: [
      {
        en: "I build robots that understand the physical world through dynamic touch, and use that understanding to support adaptive, trustworthy social interaction. My research treats tactile sensing not only as feedback for manipulation, but as a temporal and multimodal channel: vibration, force, material response, and human behavior become signals for embodied intelligence.",
        zh: "我研究如何让机器人通过动态触觉理解物理世界，并将这种理解用于更自适应、更可信的人机社会交互。我的研究并不只把触觉视为操作反馈，而是将其看作一种时序化、多模态的物理通道：振动、力、材料响应与人的行为共同成为具身智能的信号来源。"
      },
      {
        en: "As a Research Assistant at <b>The Future Laboratory, Tsinghua University</b>, I work across sensing hardware, algorithms, system building, and controlled human studies. My background in both Computer Science and Chemical Engineering lets me move between materials, sensors, learning models, and human-centered evaluation — a through-line across my work in tactile sensing, HRI, smart habitats, and multimodal AI.",
        zh: "作为 <b>清华大学未来实验室</b> 的科研助理，我的工作横跨传感硬件、算法、系统搭建与受控用户实验。计算机科学与化学工程的交叉背景，使我能够在材料、传感器、学习模型与以人为中心的评估之间建立连接——这也贯穿了我在触觉感知、人机交互、智能人居与多模态 AI 方向上的研究。"
      }
    ],
    interests: [
      { en: "Dynamic Tactile Sensing", zh: "动态触觉感知" },
      { en: "Embodied Social Intelligence", zh: "具身社会智能" },
      { en: "Human–Robot Interaction", zh: "人机交互" },
      { en: "Adaptive Robotics",       zh: "自适应机器人" },
      { en: "Multimodal AI",           zh: "多模态 AI" }
    ]
  },

  news: [
    { when: "2026.06", en: "<b>Bio-inspired Full-dimensional Tactile Sensing</b> presented in the finals of the Haptic Technology and Application Competition.", zh: "<b>仿生全维度触觉传感系统</b> 入围并展示于力触觉技术及应用大赛决赛。" },
    { when: "2026.03", en: "<b>POIROT</b> accepted to ACM/IEEE HRI 2026 (Edinburgh).", zh: "<b>POIROT</b> 论文被 ACM/IEEE HRI 2026（爱丁堡）录用。" },
    { when: "2026.03", en: "<b>AIoT Smart Home Automation Architecture</b> published in ACM IUI Companion 2026.", zh: "<b>AIoT 智能家居自动化架构</b> 论文发表于 ACM IUI Companion 2026。" },
    { when: "2025.11", en: "“Urban Fire Risk Evaluation” published in <i>Applied Spatial Analysis and Policy</i>.", zh: "《城市火灾风险评估》发表于 <i>Applied Spatial Analysis and Policy</i>。" },
    { when: "2025.07", en: "Digital cultural-heritage review accepted in <i>IEEE T-CSS</i>.", zh: "文化遗产数字化综述被 <i>IEEE T-CSS</i> 录用。" },
    { when: "2024.11", en: "Two urban-resilience papers published (<i>IJGI</i>; <i>Tropical Geography</i>).", zh: "两篇城市韧性论文发表（<i>IJGI</i>；《热带地理》）。" },
    { when: "2023",    en: "Joined The Future Laboratory, Tsinghua University.", zh: "加入清华大学未来实验室。" }
  ],

  research: {
    intro: {
      en: "I organize my work around a central question: how can robots use dynamic physical signals, especially touch, to understand materials, people, and social context?",
      zh: "我的研究围绕一个核心问题展开：机器人如何利用动态物理信号，尤其是触觉，来理解材料、人以及社会情境？"
    },
    pillars: [
      {
        title: { en: "Dynamic Tactile Sensing", zh: "动态触觉感知" },
        desc: {
          en: "High-bandwidth tactile perception through vibration, force, and contact dynamics. Instead of treating touch as a static spatial image, I study its temporal structure and how it can reveal hidden material and object properties.",
          zh: "通过振动、力与接触动态建立高带宽触觉感知。相比把触觉理解为静态空间图像，我更关注触觉的时间结构，以及它如何揭示材料与物体的隐藏属性。"
        }
      },
      {
        title: { en: "Embodied Social Intelligence", zh: "具身社会智能" },
        desc: {
          en: "Robots that interpret physical interaction as part of communication, trust, and affect. I use complex social settings, such as multi-party narrative games, to study how robot behavior can adapt to people rather than simply execute commands.",
          zh: "研究机器人如何把物理交互理解为沟通、信任与情感的一部分。我以多人叙事游戏等复杂社会场景为实验环境，探索机器人如何根据人的状态自适应，而不只是执行指令。"
        }
      },
      {
        title: { en: "Robotics & Embodied Interaction", zh: "机器人与具身交互" },
        desc: {
          en: "Interactive robotic systems that connect sensing, actuation, and human studies, from embodied game-master robots to tactile manipulation and experimental platforms for real-world interaction.",
          zh: "构建连接感知、执行与用户实验的交互机器人系统，从具身剧本杀主持机器人，到触觉操作与真实交互实验平台。"
        }
      },
      {
        title: { en: "Multimodal Habitat Intelligence", zh: "多模态人居智能" },
        desc: {
          en: "Large-scale sensing platforms that combine tactile, visual, audio, mmWave, IMU, and environmental signals for privacy-aware embodied learning in everyday spaces.",
          zh: "构建融合触觉、视觉、音频、毫米波、IMU 与环境信号的大规模感知平台，面向日常空间中的隐私友好型具身学习。"
        }
      },
      {
        title: { en: "Human-Centered Experimentation", zh: "以人为中心的实验研究" },
        desc: {
          en: "Controlled studies, multimodal logging tools, and behavioral measurement pipelines for evaluating how people perceive, trust, and adapt to intelligent systems.",
          zh: "通过受控实验、多模态记录工具与行为测量流程，评估人如何感知、信任并适应智能系统。"
        }
      }
    ]
  },

  /* most recent first; selected:true → shown in "Selected" tab */
  publications: [
    {
      year: "2026", venueShort: "IUI Companion 2026", selected: true,
      img: "assets/img/pub-aiot.jpg?v=20260606-paperfigs",
      tag: { en: "AIoT", zh: "智能家居" },
      title: {
        en: "AIoT Smart Home Automation Architecture: Autonomous Decision-Making Powered by Multimodal Large Language Models (MLLMs)",
        zh: "AIoT 智能家居自动化架构：由多模态大语言模型驱动的自主决策"
      },
      authors: "He Zhang, Yuewen Zhang, Bochen Li, Wen Chen, Yueyan Liu, Qianyao Xu, Xinyi Fu*",
      venue: { en: "Companion Proceedings of the 31st International Conference on Intelligent User Interfaces (IUI Companion ’26), Paphos, Cyprus.",
               zh: "第 31 届智能用户界面国际会议伴随论文集（IUI Companion ’26），塞浦路斯帕福斯。" },
      links: [{ label: { en: "DOI", zh: "DOI" }, url: "https://doi.org/10.1145/3742414.3794710" }]
    },
    {
      year: "2026", venueShort: "HRI 2026", selected: true,
      img: "assets/img/pub-poirot.jpg?v=20260606-paperfigs",
      tag: { en: "HRI", zh: "人机交互" },
      title: {
        en: "POIROT: Investigating Direct Tangible vs. Digitally Mediated Interaction and Attitude Moderation in Multi-party Murder Mystery Games",
        zh: "POIROT：多方剧本杀游戏中实体交互与数字媒介交互及态度调节作用的研究"
      },
      authors: "Wen Chen, Rongxi Chen, Shankai Chen, Huiyang Gong, Minghui Guo, Yingri Xu, Xintong Wu, Xinyi Fu*",
      venue: { en: "Proceedings of the 2026 ACM/IEEE International Conference on Human-Robot Interaction (HRI ’26), Edinburgh, UK.",
               zh: "2026 ACM/IEEE 国际人机交互大会（HRI ’26）论文集，英国爱丁堡。" },
      links: [
        { label: { en: "DOI", zh: "DOI" }, url: "https://doi.org/10.1145/3757279.3788663" },
        { label: { en: "arXiv", zh: "arXiv" }, url: "https://arxiv.org/abs/2603.08136" }
      ]
    },
    {
      year: "2025", venueShort: "IEEE T-CSS", selected: true,
      img: "assets/img/pub-heritage.jpg?v=20260606-paperfigs",
      tag: { en: "Survey", zh: "综述" },
      title: {
        en: "Emerging Computing Technology for Digital Culture Heritage Preservation and Inheritance: A Literature Review",
        zh: "面向数字文化遗产保护与传承的新兴计算技术：文献综述"
      },
      authors: "Xinyi Fu, Meng Li, Xiaomeng Li, Wen Chen, Lening Yu, Zixin Chen, Shuting Wen, Yilin Li, Jiachen Du, Yun Wang, Yingqing Xu, Yunbing Chen",
      venue: { en: "IEEE Transactions on Computational Social Systems, 2025.",
               zh: "IEEE 计算社会系统汇刊（IEEE T-CSS），2025。" },
      links: [
        { label: { en: "DOI", zh: "DOI" }, url: "https://doi.org/10.1109/TCSS.2025.3589324" },
        { label: { en: "IEEE", zh: "IEEE" }, url: "https://ieeexplore.ieee.org/abstract/document/11125963" }
      ]
    },
    {
      year: "2025", venueShort: "ASAP", selected: true,
      img: "assets/img/pub-fire.jpg?v=20260606-paper-covers",
      tag: { en: "Urban ML", zh: "城市计算" },
      title: {
        en: "Urban Fire Risk Evaluation Integrating Image Features with Interpretable Machine Learning Models",
        zh: "融合图像特征与可解释机器学习模型的城市火灾风险评估"
      },
      authors: "Zherui Li, Juncheng Jiang, Wen Chen, Wei Liu",
      venue: { en: "Applied Spatial Analysis and Policy, 18(4):151, 2025.",
               zh: "Applied Spatial Analysis and Policy，18(4):151，2025。" },
      links: [{ label: { en: "DOI", zh: "DOI" }, url: "https://doi.org/10.1007/s12061-025-09752-5" }]
    },
    {
      year: "2024", venueShort: "ISPRS IJGI", selected: true,
      img: "assets/img/pub-network.jpg?v=20260606-paper-covers",
      tag: { en: "Urban Resilience", zh: "城市韧性" },
      title: {
        en: "Urban Internal Network Structure and Resilience Characteristics from the Perspective of Population Mobility: A Case Study of Nanjing, China",
        zh: "人口流动视角下城市内部网络结构与韧性特征：以中国南京为例"
      },
      authors: "Zherui Li, Wen Chen*, Wei Liu, Zhe Cui",
      venue: { en: "ISPRS International Journal of Geo-Information, 13(9):331, 2024.",
               zh: "ISPRS International Journal of Geo-Information，13(9):331，2024。" },
      links: [{ label: { en: "DOI", zh: "DOI" }, url: "https://doi.org/10.3390/ijgi13090331" }]
    },
    {
      year: "2024", venueShort: "热带地理", selected: false,
      img: "assets/img/pub-covid.jpg?v=20260606-paper-covers",
      tag: { en: "Urban Resilience", zh: "城市韧性" },
      title: {
        en: "The Impact of the COVID-19 Epidemic on the Structural Resilience of Urban and Town Population Flow Networks: A Case Study of the Nanjing Metropolitan Area",
        zh: "新冠疫情对城镇人口流网络结构韧性的影响——基于南京都市圈同城化片区的实证研究"
      },
      authors: "Zherui Li, Feng Zhen, Wen Chen / 李哲睿, 甄峰, 陈稳",
      venue: { en: "Tropical Geography (热带地理), 44(11):1990–2000, 2024.",
               zh: "《热带地理》，44(11):1990–2000，2024。" },
      links: [{ label: { en: "DOI", zh: "DOI" }, url: "https://doi.org/10.13284/j.cnki.rddl.20240295" }]
    },
    {
      year: "2014", venueShort: "RSC Adv.", selected: false,
      img: "assets/img/pub-solar.jpg?v=20260606-paper-covers",
      tag: { en: "Materials", zh: "纳米材料" },
      title: {
        en: "Sn-doped TiO₂ Nanorod Arrays and Application in Perovskite Solar Cells",
        zh: "锡掺杂 TiO₂ 纳米棒阵列及其在钙钛矿太阳能电池中的应用"
      },
      authors: "Xiang Zhou, Xin Zhang, Zhuo Bao, Xun Tao, Hui Sun, Wen Chen",
      venue: { en: "RSC Advances, 4(109):64001–64005, 2014.",
               zh: "RSC Advances，4(109):64001–64005，2014。" },
      links: [{ label: { en: "DOI", zh: "DOI" }, url: "https://doi.org/10.1039/C4RA11155A" }]
    }
  ],

  projects: [
    {
      img: "assets/img/proj-poirot.jpg?v=20260606-paper-covers",
      flag: { en: "HRI 2026", zh: "HRI 2026" },
      title: { en: "POIROT", zh: "POIROT 剧本杀主持机器人" },
      sub: { en: "Plot-Oriented Interactive Robot for Organized Theatrics",
             zh: "面向叙事的具身交互机器人" },
      desc: {
        en: "My signature HRI testbed: an embodied robot game-master that hosts narrative-driven, multi-party murder-mystery games at home. The study uses an unusually rich social setting to compare direct physical clue delivery with digitally mediated interaction, showing how users' prior attitudes moderate the effect of robot embodiment.",
        zh: "我的代表性 HRI 实验平台：一套能在家庭环境中主持叙事驱动、多方剧本杀游戏的具身机器人系统。研究利用高复杂度的多人社会场景，对比实体线索分发与数字媒介交互，并揭示用户既有机器人态度如何调节具身交互效果。"
      },
      tech: ["ESP32", "ROS2", "Rhino", "Python", "Swift", "Android Studio"]
    },
    {
      img: "assets/img/proj-poirot-demo.jpg?v=20260719-poirot-demo",
      flag: { en: "Playable Demo", zh: "在线可玩" },
      title: { en: "POIROT: The Final Demo", zh: "POIROT:最后一次演示" },
      sub: { en: "A playable machine-Theory-of-Mind game master", zh: "机器心智理论的可玩化演示" },
      desc: {
        en: "A browser detective game distilled from the POIROT framework: the robot game master openly maintains a live model of the player — estimated suspicion distribution, critical-evidence coverage, and stuck-detection — and deploys graded, non-spoiling hints exactly when the player's beliefs outrun their evidence. Fully client-side, zero-dependency, bilingual.",
        zh: "从 POIROT 框架提炼出的浏览器侦探游戏:机器主持人公开维护对玩家的实时模型——怀疑分布估计、关键证据覆盖率与「卡住」判定,并在玩家信念超前于证据时分级投放不剧透的提示。纯前端、零依赖、中英双语。"
      },
      links: [
        { label: { en: "Play (EN)", zh: "开始游玩 (EN)" }, url: "https://wayneusc.github.io/poirot/en.html" },
        { label: { en: "Play (中文)", zh: "开始游玩 (中文)" }, url: "https://wayneusc.github.io/poirot/" }
      ],
      tech: ["Machine ToM", "Player Modeling", "Adaptive Hinting", "JavaScript", "Narrative Design"]
    },
    {
      img: "assets/img/proj-smart-surface.jpg?v=20260602-cover",
      flag: { en: "Collaborative UX", zh: "合作项目" },
      title: { en: "Smart Surface", zh: "车载智能表面系统" },
      sub: { en: "In-vehicle multimodal haptic interaction", zh: "面向智能座舱的多模态触觉交互" },
      desc: {
        en: "A collaborative project among Tsinghua Future Laboratory, CityU, and HKPC, developing and evaluating an in-vehicle smart-surface interaction system with visual, audio, surface-haptic, mid-air haptic, and gesture modalities. I contributed to evaluation planning, user-study design, and data analysis; professional-operation tests met the 75% technical requirement with 81.1% adjusted accuracy.",
        zh: "清华大学未来实验室、香港城市大学与香港生产力促进局（HKPC）的合作项目，围绕智能座舱中的视觉、音频、表面触觉、空中触觉与手势等多模态交互进行系统搭建与评估。我参与评估方案、用户实验设计与数据分析；专业操作测试达到 81.1% 调整准确率，满足 75% 技术指标要求。"
      },
      tech: ["Haptic UX", "User Study", "Data Analysis", "Python", "Smart Cockpit"]
    },
    {
      img: "assets/img/proj-bionic-haptics.jpg?v=20260606-bionic-haptics-en",
      flag: { en: "Competition Finalist", zh: "大赛决赛项目" },
      title: { en: "Bio-inspired Full-dimensional Tactile Sensing", zh: "仿生全维度触觉传感系统" },
      sub: { en: "Mechanism-bionic tactile sensing for interpretable contact events",
             zh: "面向可解释接触事件的机制仿生触觉系统" },
      desc: {
        en: "A finalist project in the Haptic Technology and Application Competition, developed with Tsinghua Future Laboratory and Beijing Qinggong Intelligent Technology. The system reframes tactile sensing from low-dimensional readings into full-dimensional contact events, integrating representation, contact process, and interaction relations for interpretable, invertible, controllable, and generalizable tactile perception.",
        zh: "力触觉技术及应用大赛决赛项目，由清华大学未来实验室与北京清工智能科技有限公司共同完成。系统将触觉从低维读数重新展开为「表征 × 过程 × 交互」的全维度接触事件，面向可解释、可反演、可控制、可泛化的触觉感知。"
      },
      tech: ["Tactile Sensing", "Bio-inspired Design", "Calibration", "Intelligent Computing", "Rapid Prototyping"],
      links: [{ label: { en: "Poster", zh: "决赛壁报" }, url: "assets/pdf/haptic-competition-poster.pdf" }]
    },
    {
      img: "assets/img/proj-tactile-mapping.jpg?v=20260606-tactile-mapping",
      flag: { en: "Upcoming Study", zh: "即将开展" },
      title: { en: "Tactile Mapping Human Study", zh: "触觉映射人因实验" },
      sub: { en: "Mapping material properties to perceived touch",
             zh: "从材料物性到主观触觉感知的映射" },
      desc: {
        en: "An upcoming human-subject study that maps tactile material properties to perceived roughness, sliding resistance, and hardness. The protocol combines driven contact with free exploration, repeated single-dimension blocks, vibration sensing, 6D force data, dual-camera video, and iPad/Web-based trial logging to build a structured physical-to-perceptual tactile dataset.",
        zh: "一项即将开展的人因实验，旨在建立材料物性与粗糙度、滑动阻力、硬度等主观触觉感知之间的映射。实验结合带动接触与自由探索、单维度重复 block、振动传感、六维力数据、双机位录像，以及 iPad/Web 录入工具，构建结构化的物理—感知触觉数据集。"
      },
      tech: ["Tactile Sensing", "Human Study", "6D Force", "Vibration", "SwiftUI", "Data Collection"]
    },
    {
      img: "assets/img/proj-habitat.jpg",
      flag: { en: "Platform", zh: "实验平台" },
      title: { en: "Smart Habitat Platform", zh: "人居环境多模态实验平台" },
      sub: { en: "Multimodal dataset for embodied learning", zh: "面向具身学习的多模态数据库" },
      desc: {
        en: "A benchmark-quality multimodal dataset (depth + audio + mmWave + IMU + tactile + a 60 m² capacitive floor + olfactory sensing) captured in real living scenarios, for privacy-preserving human-activity understanding in smart habitats.",
        zh: "在真实居住场景中采集的基准级多模态数据库（深度 + 音频 + 毫米波 + IMU + 触觉 + 60㎡ 电容地板 + 嗅觉感知），用于隐私友好的人居环境人体活动理解与具身学习。"
      },
      tech: ["Depth", "mmWave", "Tactile", "Capacitive Floor", "IMU"]
    },
    {
      img: "assets/img/proj-aiot.jpg?v=20260607-project-covers",
      flag: { en: "AIoT", zh: "AIoT" },
      title: { en: "AIoT Smart-Home Automation", zh: "AIoT 智能家居自动化" },
      sub: { en: "Autonomous decisions powered by multimodal LLMs", zh: "多模态大模型驱动的自主决策" },
      desc: {
        en: "A highly extensible smart-home framework driven by multimodal LLMs, using a single camera as the minimal sensing unit for unified perception and structured labeling — enabling autonomous cleaning scheduling, health reports, and item tracking.",
        zh: "以多模态大语言模型（MLLM）为核心、高扩展性的智能家居框架，以单摄像头作为最小感知单元，实现统一感知与结构化标注，支持清洁调度、健康报告、物品追踪等自主决策。"
      },
      tech: ["MLLM", "Computer Vision", "Home Automation"]
    },
    {
      img: "assets/img/proj-roboleague.jpg?v=20260607-project-covers",
      flag: { en: "Swarm", zh: "集群机器人" },
      title: { en: "RoboLeague", zh: "RoboLeague 集群定位" },
      sub: { en: "Swarm localization & physical intelligence", zh: "集群定位与物理智能" },
      desc: {
        en: "Efficient spatial localization and coordination for robot swarms, combining GIS principles with TRACLUS trajectory clustering and simulated-annealing optimization.",
        zh: "面向集群机器人的高效空间定位与协调，结合 GIS 理念、TRACLUS 轨迹聚类与模拟退火优化方法实现物理智能协同。"
      },
      tech: ["TRACLUS", "Simulated Annealing", "GIS", "MATLAB"]
    },
    {
      img: "assets/img/proj-shakesort.jpg?v=20260607-project-covers",
      flag: { en: "Tactile", zh: "触觉感知" },
      title: { en: "OpenArm-Based ShakeSort", zh: "OpenArm-Based ShakeSort" },
      sub: { en: "Haptic object identification by active shaking", zh: "基于主动摇晃与振动触觉的物体识别" },
      desc: {
        en: "A dynamic tactile-sensing system built on OpenArm that identifies hidden contents in sealed blind boxes by actively shaking them and reading high-bandwidth vibration cues. The project treats touch as a temporal signal, showing how robots can infer invisible physical properties when vision is unavailable or unreliable.",
        zh: "基于 OpenArm 机械臂的动态触觉感知系统，通过主动摇晃密封盲盒并读取高带宽振动信号，识别其中隐藏物体。项目将触觉视为时序信号，展示机器人如何在视觉不可用或不可靠时推断不可见的物理属性。"
      },
      tech: ["OpenArm", "Tactile Sensing", "Vibration", "Robotic Arm", "ML Classification"]
    },
    {
      img: "assets/img/proj-sofa.jpg",
      flag: { en: "Affective", zh: "情感计算" },
      title: { en: "Smart Sofa Sensing", zh: "智能沙发姿态检测" },
      sub: { en: "Posture & affect from a pressure array", zh: "基于压力阵列的姿态与情感感知" },
      desc: {
        en: "A wireless seating-pressure system (flexible sensor array + ESP32) that classifies occupancy, position, and posture via machine learning, with companion Web and iOS visualization apps — extended toward affective-state inference.",
        zh: "由柔性压力传感器阵列与 ESP32 构成的无线坐姿感知系统，运用机器学习识别人员数量、位置与姿态，并配套 Web 与 iOS 端可视化应用，进一步拓展到情感状态推断。"
      },
      tech: ["ESP32", "Pressure Array", "Web", "iOS", "ML"]
    },
    {
      img: "assets/img/proj-armrl.jpg",
      flag: { en: "RL", zh: "强化学习" },
      title: { en: "Robotic Arm + RL", zh: "机械臂与强化学习" },
      sub: { en: "Additive manufacturing & intelligent therapy", zh: "增材制造与智能理疗" },
      desc: {
        en: "Using simulation and reinforcement learning to develop robotic-arm systems for additive (3D-printing) manufacturing and intelligent physical therapy.",
        zh: "利用仿真环境与强化学习算法，开发面向增材制造（3D 打印）与智能物理治疗的机械臂系统。"
      },
      tech: ["Reinforcement Learning", "Simulation", "3D Printing"]
    }
  ],

  experience: {
    work: [
      { when: "2023 – Present", what: { en: "Research & Teaching Assistant", zh: "科研助理 / 助教" },
        where: { en: "The Future Laboratory, Tsinghua University", zh: "清华大学 未来实验室" } },
      { when: "2022 – 2023", what: { en: "Researcher", zh: "研究员" },
        where: { en: "New Jersey Institute of Technology", zh: "新泽西理工学院（NJIT）" } },
      { when: "2019 – 2022", what: { en: "Volunteer Researcher", zh: "志愿研究员" },
        where: { en: "USC Interaction Lab", zh: "南加州大学 交互实验室" } }
    ],
    education: [
      { when: "2018 – 2022", what: { en: "M.S. in Computer Science", zh: "计算机科学 硕士" },
        where: { en: "University of Southern California", zh: "南加州大学（USC）" } },
      { when: "2016 – 2018", what: { en: "M.S. in Chemical Engineering", zh: "化学工程 硕士" },
        where: { en: "University of Southern California", zh: "南加州大学（USC）" } },
      { when: "2010 – 2015", what: { en: "B.S. in Chemical Engineering", zh: "化学工程 学士" },
        where: { en: "Nanjing Tech University", zh: "南京工业大学" } }
    ]
  },

  outreach: {
    img: "assets/img/outreach.jpg",
    kicker: { en: "Bilingual Knowledge Channel · Bilibili", zh: "中英双语知识频道 · 哔哩哔哩" },
    title: { en: "Phoenician City-State No. 23", zh: "腓尼基城邦 23 号" },
    tagline: { en: "Making global ideas accessible across language and culture.",
               zh: "让全球的思想跨越语言与文化的边界。" },
    stats: [
      { num: "~30K", lab: { en: "Followers", zh: "粉丝" } },
      { num: "810K+", lab: { en: "Views", zh: "播放量" } },
      { num: "200+", lab: { en: "Episodes", zh: "期节目" } }
    ],
    topics: { en: "A bilingual media initiative translating global insights for Chinese audiences — across technology, finance, culture, and psychology.",
              zh: "一档面向中文观众的双语知识节目，内容覆盖科技、金融、文化与心理学等领域，将全球洞见带给本地受众。" }
  },

  awards: [
    { ic: "🏅", ti: { en: "Finalist — Haptic Technology and Application Competition", zh: "力触觉技术及应用大赛 决赛入围" },
      de: { en: "Bio-inspired full-dimensional tactile sensing system.", zh: "仿生全维度触觉传感系统。" } },
    { ic: "🏆", ti: { en: "1st Place — Machine Learning Project Competition", zh: "机器学习项目竞赛 一等奖" },
      de: { en: "", zh: "" } },
    { ic: "🎤", ti: { en: "Invited Talk", zh: "受邀演讲" },
      de: { en: "“The Intelligent Era: Applying to & Building a Career from U.S. Robotics Graduate Programs.”",
            zh: "《智能时代：美国机器人研究生项目申请及就业攻略》。" } }
  ]
};
