/*
 * GAME CONTENT — edit this file to change the story.
 *
 * Everything the player sees (except built-in UI labels) is defined here.
 * Any text may be:
 *   - a plain string (same in every language),
 *   - an object { en: '...', ja: '...' },
 *   - a function (s) => string | { en, ja }   where `s` is the game state
 *     (see README.md for everything `s` offers: s.room, s.n, s.flag(),
 *      s.confirmed(id), s.confirmedCount(), s.visits(), s.note(), ...).
 *
 * Markup: blank line = new paragraph, *italic*, **bold**, ~~struck~~.
 * Templates: {n} current room, {floor}, {room:charId}, {name:charId}, {wish:wishId},
 * {at} the hour being viewed in the past, {player} the player's name.
 *
 * The content follows scenes-v21.csv (Japanese names from its 2nd column). Narration inside scenes is in *italics*. Cells that are still
 * sketches are written as draft(`…`): the sketch shows in the game marked
 * "✎ Draft", so unfinished slots are easy to spot while playtesting. To finish
 * one, replace draft(`…`) with T(`English`, `日本語`).
 */
(function () {
  const T = (en, ja) => ({ en, ja });

  // A cell that is still a sketch. Shown as-is (in English) in both languages.
  const draft = sketch => T(`✎ *Draft:* ${sketch}`, `✎ *下書き:* ${sketch}`);

  const NOTHING = T('There is nothing interesting in this room.', 'この部屋には特に気になるものはない。');
  const LOCKED = T('The room is locked.', '部屋には鍵がかかっている。');

  // A body with one of the killer's notes beside it. who: 'man' or 'woman'.
  const sinNote = (who, sin, sinJa) => T(
    `A ${who} lies dead on the floor. A note lies beside ${who === 'man' ? 'him' : 'her'}:\n\n"The Sin of ${sin} has been executed."`,
    `床には${who === 'man' ? '男' : '女性'}の死体が横たわっていて、そばにメモが落ちている。\n\n「${sinJa}の罪は執行された。」`);

  // A scene whose speakers are anonymized as #1, #2, …: adds a "Characters:"
  // line listing every #N that appears in the English text.
  const anon = (en, ja) => {
    const cast = [...new Set(en.match(/#\d+/g) || [])].sort((a, b) => a.slice(1) - b.slice(1));
    return T(`Characters: ${cast.join(', ')}\n\n${en}`, `登場人物：${cast.join('、')}\n\n${ja}`);
  };

  // A room where the player picks up a paper: `found` on the visit that hands
  // it over, nothing of interest on later visits.
  const pickUp = (paper, found) => ({
    text: s => (s.flag(`took-${paper}`) ? NOTHING : found),
    onEnter: s => {
      if (s.hasPaper(paper)) s.set(`took-${paper}`);
      s.give(paper);
    },
  });

  // ---------------------------------------------------------------------------
  // Wishes — shown to the player as a list (alphabetically), matched to names.
  // ---------------------------------------------------------------------------
  const wishes = [
    { id: 'revive',    ...T('To bring their wife back to life', '妻を生き返らせること') },
    { id: 'troubles',  ...T('To forget all the troubles in life', '人生のあらゆる悩みを忘れること') },
    { id: 'job',       ...T('To get a job', '仕事に就くこと') },
    { id: 'target',    ...T('For their assassination mission to succeed', '暗殺の任務が成功すること') },
    { id: 'fly',       ...T('To be able to fly', '空を飛べるようになること') },
    { id: 'minds',     ...T('To read minds', '人の心を読めるようになること') },
    { id: 'daughter',  ...T('To meet their daughter', '娘に会うこと') },
    { id: 'prophet',   ...T('To become a prophet', '預言者になること') },
    { id: 'animals',   ...T('To talk to animals', '動物と話せるようになること') },
    { id: 'food',      ...T('To eat the most delicious food ever', 'この世で一番おいしい料理を食べること') },
    { id: 'richest',   ...T('To be the richest person in the world', '世界一の金持ちになること') },
    { id: 'help',      ...T('To be of help to someone', '誰かの役に立つこと') },
    { id: 'fun',       ...T('To have fun', '楽しい時間を過ごすこと') },
    { id: 'infinite',  ...T('To get infinite wishes', '願いを無限に手に入れること') },
    { id: 'peace',     ...T('For the world they live in to be peaceful', '自分の生きる世界が平和であること') },
    { id: 'gender',    ...T('To change their gender', '性別を変えること') },
    { id: 'attract',   ...T('To attract the next girl they meet', '次に出会う女の子を惹きつけること') },
    { id: 'streamer',  ...T('To be a top streamer', '配信の視聴者を増やすこと') },
    { id: 'famous',    ...T('To become a famous person', '有名人になること') },
    { id: 'forever',   ...T('To enjoy life here forever', 'ここでの暮らしを永遠に楽しむこと') },
    { id: 'two',       ...T('To be able to be in two places at once', '同時に二か所にいられるようになること') },
    { id: 'invisible', ...T('To become invisible', '透明になること') },
    { id: 'young',     ...T('To become young', '若返ること') },
    { id: 'deathday',  ...T('For the day they die never to arrive', '自分が死ぬ日が永遠に来ないこと') },
    { id: 'chess',     ...T('To be the best chess player in the world', '世界一のチェスプレイヤーになること') },
    { id: 'own',       ...T('To own the hotel', 'このホテルのオーナーになること') },
    { id: 'secrets',   ...T('To learn the secrets of the hotel', 'このホテルの秘密を知ること') },
    { id: 'alone',     ...T('To be left alone', '誰にも邪魔されないこと') },
    { id: 'god',       ...T('To get closer to God', '神様に近づくこと') },
    { id: 'wrong',     ...T('To never say something wrong again', '二度と間違ったことを言わないこと') },
  ];

  // ---------------------------------------------------------------------------
  // Characters — the hidden answers, one per register row.
  //   gender:  'M' or 'F', shown on the Guest List
  //   checkIn: the hour (0–23) they checked in, or a list of hours; listed on
  //            the Check-in Times sheet
  //   fate:    what became of them, shown on the fates screen after clearing.
  //            (Written up from the CSV's Fate Summary.)
  //   roomLabel: optional; shown on the fates screen instead of "Room {room}"
  //   kana:    the reading of the Japanese name, used to sort it in Japanese
  // The guest with `player: true` is the player: their name is the one given
  // in the prologue, and they are left off the Guest List.
  // Rooms may be numbers or strings (use strings for anything above 2^53).
  // ---------------------------------------------------------------------------
  const characters = [
    {
      id: 'caleb', name: T('Caleb Williams', '鈴木 翔太'), kana: 'すずき　しょうた', gender: 'M', wish: 'revive', room: 14, checkIn: 11,
      fate: T(
        `Caleb checked in hoping to bring his late wife back. The moment he stepped into Room 14, the hotel granted it, at a price: Caleb was gone, and Megan Williams woke up in his place. She has spent every hour since trying to remember how she got here.`,
        `鈴木翔太は亡くした妻を生き返らせたいと願ってチェックインした。14号室に足を踏み入れた瞬間、その願いは叶ったが、それには代償があった。翔太の姿は消え、代わりに妻の結衣が目を覚ましたのだ。彼女はそれ以来ずっと自分がどうやってここに来たのかを思い出そうとしている。`),
    },
    {
      id: 'nigel', name: T('Nigel Richmond', '羽生 直樹'), kana: 'はぶ　なおき', gender: 'M', wish: 'troubles', room: 2, checkIn: 10,
      fate: T(
        `Nigel Richmond was the greatest chess player alive, and a tired man. He wished to forget all the troubles in his life, and in Room 2 he forgot everything else along with them. Now he sits in the Game Room, remembering only his room number.`,
        `羽生直樹は当代最高のチェスプレイヤーだったが、心はすっかり疲れ切っていた。人生のあらゆる悩みを忘れたいと願った彼は、2号室で悩みもろとも全てを忘れてしまった。今はゲームルームに座っているが、覚えているのは自分の部屋番号だけだ。`),
    },
    {
      id: 'chuck', name: T('Chuck Morrison', '受田 司'), kana: 'うけだ　つかさ', gender: 'M', wish: 'job', room: 3, checkIn: 21,
      fate: T(
        `Chuck had been looking for work for a long time. When he walked into Room 3, he walked straight into a job: he became the hotel's receptionist, taking the place of the woman who had stood behind the desk all day. His own key card is still lying under the guest book.`,
        `受田司は長い間仕事を探していた。3号室に入ったその瞬間、彼はついに仕事を手に入れた。一日中フロントに立っていた女性に代わって、ホテルのフロント係になったのだ。彼自身のカードキーは今も宿帳の下に置かれたままだ。`),
    },
    {
      id: 'sophia', name: T('Sophia Redstone', '木村 エマ'), kana: 'きむら　えま', gender: 'F', wish: 'target', room: 4, checkIn: 18,
      fate: T(
        `Sophia was hired to kill the head of a large company, and the hotel promised her that her target would arrive at 7 PM. She fired the moment the door opened. Only when she knelt beside the body did she see whose face it was: Gabriel Redstone, the father she had not seen since she was a little girl. She could not live with what she had done.`,
        `木村エマはある大企業の社長を暗殺する依頼を受けていた。部屋に置かれたメモには、ターゲットは19時に現れると書かれていた。扉が開いた瞬間、彼女は引き金を引いた。遺体のそばにひざまずき、そこで初めて彼女はその顔を見た。幼い頃に生き別れた父、木村健二だった。自分のしてしまったことに、彼女は耐えられなかった。`),
    },
    {
      id: 'mark', name: T('Mark Zhang', '青木 大輔'), kana: 'あおき　だいすけ', gender: 'M', wish: 'fly', room: 5, checkIn: 11,
      fate: T(
        `Mark wished to fly. In Room 5 he became a small bird, and spent the day fluttering through the hotel. That evening Emily, the one guest who could understand him, carried him out through the front doors to find somewhere he could really fly. His suitcase is still in Room 5.`,
        `青木大輔は空を飛びたいと願った。5号室で小さな鳥になった彼は、一日中ホテルの中を飛び回った。その夜、彼の言葉が分かるただ一人の客、小鳥遊莉花が、自由に飛べる場所を探すため彼を肩に乗せてホテルを出ていった。彼のスーツケースは今も5号室に残されたままだ。`),
    },
    {
      id: 'philip', name: T('Philip Holder', '清水 太郎'), kana: 'しみず　たろう', gender: 'M', wish: 'minds', room: 1, checkIn: 20,
      fate: T(
        `Philip wished to read minds, and spent his night here putting it to work in the Game Room. He checked out early this morning with his pockets full, and Room 1 has been empty since.`,
        `清水太郎は人の心を読めるようになりたいと願い、その夜、ゲームルームでその力を存分に使った。今朝早くたんまり稼いでチェックアウトし、それ以来1号室は空室のままだ。`),
    },
    {
      id: 'gabriel', name: T('Gabriel Redstone', '木村 健二'), kana: 'きむら　けんじ', gender: 'M', wish: 'daughter', room: 486, checkIn: 11,
      fate: T(
        `Gabriel, the head of a large company, came to the hotel to see the daughter he had lost touch with long ago. He spent the afternoon searching, until a fortune-teller told him he would find who he wished to find in Room 4 at 7 o'clock. He did. She was waiting with a gun, hired to kill him, and neither of them knew the other until it was too late.`,
        `大企業の社長である木村健二はずっと昔に生き別れた娘に会うためにホテルを訪れた。午後中探し回った末、ある女性に「会いたい人に、19時に4号室で会える」と告げられ、その言葉通り娘に会えた。だが娘は、彼を殺すよう雇われ、銃を手に待っていたのだ。互いの正体に気づいたときには、もう手遅れだった。`),
    },
    {
      id: 'serena', name: T('Serena Becker', '九十九 百花'), kana: 'つくも　ももか', gender: 'F', wish: 'prophet', room: 24, checkIn: 14,
      fate: T(
        `Serena wished to become a prophet. From the moment she entered Room 24, a new truth came to her every hour: who would die, and where. Every one of them came true. At 8 o'clock, the revelation was about her. She fled to her room, and at the stroke of midnight her heart gave out, just as foretold.`,
        `九十九百花は預言者になりたいと願った。24号室に入ってから、一時間ごとに未来が見えるようになり、その預言はことごとく的中した。そして20時の預言が告げたのは彼女自身の死で、真夜中ちょうどに、彼女は心臓発作で息を引き取った。`),
    },
    {
      id: 'emily', name: T('Emily Watson', '小鳥遊 莉花'), kana: 'たかなし　りか', gender: 'F', wish: 'animals', room: 25, checkIn: 14,
      fate: T(
        `Emily wished to talk to animals. The first one she met was a small bird who had been a man until earlier that day. They got on wonderfully. That evening she walked out of the hotel with him on her shoulder, promising to find him somewhere he could really fly.`,
        `小鳥遊莉花は動物と話せるようになりたいと願った。彼女が最初に出会ったのはつい先ほどまで人間だったという小さな鳥だった。二人はすっかり意気投合し、その夜、莉花は自由に飛べる場所を見つけてあげると約束して彼を肩に乗せてホテルを後にした。`),
    },
    {
      id: 'dominique', name: T('Dominique Richard', '田中 博'), kana: 'たなか　ひろし', gender: 'M', wish: 'food', room: 40, checkIn: 7,
      fate: T(
        `Dominique, a famous food critic, wished to eat the most delicious food ever, and breakfast delivered. He couldn't resist coming back for the leftovers. At 10 o'clock, mouth still full, he became the first victim: the Sin of Gluttony.`,
        `有名な料理評論家の田中博は、この世で一番おいしい料理を食べたいと願い、その願いは朝食で叶った。だが彼は、残り物を食べに戻らずにはいられなかった。そして10時、料理を口いっぱいに頬張ったまま、暴食の罪として真っ先に殺された。`),
    },
    {
      id: 'helen', name: T('Helen Lynch', '冬坂 春菜'), kana: 'ふゆさか　はるな', gender: 'F', wish: 'richest', room: 41, checkIn: 9,
      fate: T(
        `Helen already owned a famous jewelry brand, but it was never enough. She wished to be the richest person in the world, and by mid-morning she was. After finding her neighbor's body at lunch, she ran back to Room 41 to lock herself in. It didn't help: the invisible man had slipped in behind her. She became the Sin of Greed.`,
        `すでに有名ジュエリーブランドのオーナーだった冬坂春菜は、それに飽き足らず、世界一の金持ちになりたいと願った。願いはその朝のうちに叶ったが、昼食時に隣人の遺体を見つけた彼女は、41号室に駆け戻って閉じこもった。しかし、背後から部屋に滑り込んでいた透明人間によって、強欲の罪として殺された。`),
    },
    {
      id: 'aida', name: T('Aida Long', '中藤 理亜'), kana: 'ちゅうとう　りあ', gender: 'F', wish: 'help', room: 76, checkIn: 22,
      fate: T(
        `Aida wished to be of help to someone. That someone turned out to be you: the guest she nearly bumped into outside her room, with no idea where they were. She pointed you to the elevator, and gave you the first row of your register.`,
        `中藤理亜は誰かの役に立ちたいと願った。その「誰か」とは、部屋の前でぶつかりそうになったあなただった。彼女はエレベーターへの行き方を教え、宿帳の最初の一行を埋める手がかりをくれた。`),
    },
    {
      id: 'you', player: true, wish: 'fun', room: 78,
      fate: T(
        `That's you. You wished to have fun, and if you've made it this far, we hope the hotel granted your wish.`,
        `これはあなた自身のことだ。あなたの願いは「楽しい時間を過ごすこと」だった。ここまで辿り着いたのなら、ホテルがその願いを叶えたのだと信じたい。`),
    },
    {
      id: 'lorenzo', name: T('Lorenzo Conti', 'ロレンツォ・コンティ'), kana: 'ろれんつぉ　こんてぃ', gender: 'M', wish: 'infinite', room: 444, checkIn: [21, 22, 23],
      fate: T(
        `Lorenzo wished for infinite wishes, and the hotel found a way. Each time he enters Room 444, he dies; each time, he is back at the front desk, checking in and making another wish. He has done it many times since 9 o'clock last night, and he isn't stopping. You may have seen him at the check-in desk.`,
        `ロレンツォ・コンティは無限の願いを手に入れたいと願い、ホテルはそれを叶える方法を見つけた。444号室に入るたびに彼は命を落とすが、そのたびにフロントへ戻って再びチェックインし、新しい願いを伝える。昨夜21時から何度もそれを繰り返しているが、やめる気配はまったくない。あなたはフロントで彼を見かけたかもしれない。`),
    },
    {
      id: 'alice', name: T('Alice Wu', 'アリス・ミラー'), kana: 'ありす　みらー', gender: 'F', wish: 'peace', room: 666, checkIn: 18,
      fate: T(
        `Alice wished that the world she lived in were peaceful. Rather than change this world, the hotel changed hers: when she stepped into Room 666, she was carried away to another one, quiet and kind. Just as the prophet foresaw, Alice went to Wonderland.`,
        `アリス・ミラーは自分の生きる世界が平和であることを願った。ホテルはこの世界を変える代わりに、彼女の世界を変えた。666号室に足を踏み入れた瞬間、彼女は静かで優しい異世界へと転移した。預言者の言葉通り、アリスはワンダーランドへ行ったのだ。`),
    },
    {
      id: 'taylor', name: T('Taylor Chen', '和泉 千尋'), kana: 'いずみ　ちひろ', gender: 'M', wish: 'gender', room: 848, checkIn: 7,
      fate: T(
        `Taylor checked in as a man and wished to change his gender; by breakfast, she was a woman. Within minutes she fell head over heels for Jacob, who had wished to attract the next girl he met. When Jacob was murdered that afternoon, her grief turned to fury. She spent the rest of the day hunting the killer, and when the prophet foretold that Wrath would die in Room 8484, she went there knife in hand, hoping to confront the killer. She became the Sin of Wrath.`,
        `和泉千尋は男性としてチェックインし、性別を変えたいと願い、朝食の頃には女性になっていた。そして数分のうちに「次に出会う女の子を惹きつけたい」と願った渡辺哲也に夢中になった。その日の午後に哲也が殺されると、彼女の悲しみは怒りに変わった。残りの一日を犯人探しに費やし、「憤怒は8484号室で死ぬ」という預言を聞くと、犯人と対決しようとナイフを手にその部屋へ向かった。そして憤怒の罪として殺された。`),
    },
    {
      id: 'jacob', name: T('Jacob Wellsman', '渡辺 哲也'), kana: 'わたなべ　てつや', gender: 'M', wish: 'attract', room: 849, checkIn: 8,
      fate: T(
        `Jacob wished to attract the next girl he met. That girl was Taylor, who had been a man until that morning. They spent a happy few hours together, until she stepped next door for a minute and came back to find him dead: the Sin of Lust.`,
        `渡辺哲也は次に出会う女の子を惹きつけたいと願った。その願いどおり、その朝まで男性だった和泉千尋が彼に夢中になり、二人は幸せな数時間を過ごした。だが、彼女が少しだけ隣の自室へ戻っている間に、彼は色欲の罪として殺された。`),
    },
    {
      id: 'lisa', name: T('Lisa Schmidt', '五十嵐 七海'), kana: 'いがらし　ななみ', gender: 'F', wish: 'streamer', room: 1214, checkIn: 13,
      fate: T(
        `Lisa wished to become a top streamer, and 30 million people tuned in to her birthday stream. Then, mid-sentence, she vanished. Another guest's wish had just come true, and there was only room in the world for one Lisa. Her birthday cake is still on the desk in Room 1214.`,
        `五十嵐七海は配信の視聴者を増やしたいと願い、誕生日配信には3000万人が集まった。しかしその配信中、彼女は話の途中で忽然と姿を消した。別の客の願いが叶ったことで、この世界にいられる七海は一人だけになったのだ。彼女のバースデーケーキは、今も1214号室の机の上に残されている。`),
    },
    {
      id: 'jessica', name: T('Jessica Stuart', '池田 結菜'), kana: 'いけだ　ゆな', gender: 'F', wish: 'famous', room: 1729, checkIn: 15,
      fate: T(
        `Jessica wished to become famous, and the hotel made her the most famous person it could find: Lisa Schmidt. At 3:15 the real Lisa disappeared and Jessica became her, face, fans and all, but with none of Lisa's memories. She is still in the Movie Room, introducing herself as Lisa.`,
        `池田結菜は有名人になりたいと願った。ホテルは彼女を、見つけられる限り一番有名な人物である五十嵐七海に変えた。15時15分、本物の七海が消え、結菜が七海になった。顔もファンもそのまま引き継いだが、七海の記憶だけは何一つ持っていなかった。彼女は今もシアタールームで「七海」と名乗っている。`),
    },
    {
      id: 'jones', name: T('Jones Spencer', '長谷川 悠人'), kana: 'はせがわ　ゆうと', gender: 'M', wish: 'forever', room: 2049, checkIn: 18,
      fate: T(
        `Jones wished to enjoy life at the hotel forever, without ever working another day. He walked into Room 2049 to begin his endless holiday, and was shot within the minute: the invisible man had overheard his wish when he checked in. He became the Sin of Sloth. It seems he will stay here forever after all.`,
        `長谷川悠人は二度と働かずに、このホテルでの暮らしを永遠に楽しみたいと願った。終わらない休暇を始めようと2049号室に入った直後、彼は撃たれた。チェックインのときにその願いを透明人間に聞かれていたのだ。彼は怠惰の罪として殺された。結局、望みどおり永遠にここにいることになりそうだ。`),
    },
    {
      id: 'marie', name: T('Marie Sinclair', '白石 美月'), kana: 'しらいし　みづき', gender: 'F', wish: 'two', room: 2050, checkIn: 15,
      fate: T(
        `Marie wished to be in two places at once, and she has been ever since. While one Marie ate dinner in the Dining Room, the other was in Room 2050 and heard the gunshot next door. Both of them are still enjoying their stay, though only one of them came down to the Common Room today.`,
        `白石美月は同時に二か所にいたいと願い、それ以来ずっと二か所にいる。一人の美月がダイニングルームで夕食をとっている間、もう一人は2050号室にいて、隣の部屋の銃声を聞いた。二人とも今も滞在を楽しんでいる。`),
    },
    {
      id: 'victor', name: T('Victor Frost', '富田 虚'), kana: 'とみた　うつろ', gender: 'M', wish: 'invisible', room: 8484, checkIn: 7,
      fate: T(
        `Victor wished to become invisible, and used it to commit what he believed was the perfect crime: seven murders, one for each deadly sin. Gluttony, Greed, Lust, Envy, Sloth, Wrath: each was shot by a killer no one could see, with a note left beside the body. For the seventh, Pride, he chose himself, and left his finest work in the Dining Room for you to find.`,
        `富田虚は透明になりたいと願い、その力で、七つの大罪になぞらえた七つの殺人という、自らが完璧だと信じる犯罪を実行した。暴食、強欲、色欲、嫉妬、怠惰、憤怒の六人は皆、誰にも見えない犯人に撃たれ、遺体のそばにはメモが残された。七つ目の傲慢には、自分自身を選んだ。ダイニングルームに残された彼の遺体こそが、その「最高傑作」の締めくくりだった。`),
    },
    {
      id: 'polina', name: T('Polina Mariya', '伊呂波 初'), kana: 'いろは　うい', gender: 'F', wish: 'young', room: 8962, checkIn: 16,
      fate: T(
        `Polina wished to be young again. The hotel took her at her word: she walked into Room 8962 a grown woman, and has been a baby ever since, crying behind a locked door all night.`,
        `伊呂波初は若返りたいと願い、ホテルはその言葉を文字通りに受け取った。大人の女性として8962号室に入った彼女はそれ以来ずっと赤ん坊のまま、鍵のかかった扉の向こうで一晩中泣いている。`),
    },
    {
      id: 'lucy', name: T('Lucy Stone', '森田 彼方'), kana: 'もりた　かなた', gender: 'F', wish: 'deathday', room: 8963, checkIn: 7,
      fate: T(
        `Lucy wished that the day she dies would never arrive. It never does: she relives the day she checked in, over and over. This is her 12,345th time through, and she knows every body before it falls. Nobody believes her, and she has long since stopped expecting anyone to.`,
        `森田彼方は自分が死ぬ日が永遠に来ないことを願い、その日は本当に来なくなった。彼女はチェックインした日を何度も繰り返しており、今回で12,345回目になる。誰がいつ死ぬのかも全て知っているが、誰も彼女の言葉を信じず、彼女ももうとっくに期待するのをやめた。`),
    },
    {
      id: 'robert', name: T('Robert Hansen', 'ロバート・ハンセン'), kana: 'ろばーと　はんせん', gender: 'M', wish: 'chess', room: 8964, checkIn: 13,
      fate: T(
        `Robert had lost to Nigel Richmond in five straight world championship finals, so he wished to be the best chess player in the world. He got it the easy way: Richmond forgot everything, chess included. But Robert couldn't bear hearing that Richmond was still the greatest, and stormed back to his room, unaware that the invisible man was following him. He was shot as he walked through the door. He became the Sin of Envy.`,
        `ロバート・ハンセンは世界選手権の決勝で五年連続、羽生直樹に敗れてきた。だからこそ、世界一のチェスプレイヤーになりたいと願った。願いは、羽生がチェスも含めて全てを忘れてしまったことで叶った。しかし、羽生こそ史上最高だという声に耐えられず自室へ戻った彼は、後をつけてきた透明人間によって、嫉妬の罪として殺された。`),
    },
    {
      id: 'cody', name: T('Cody Hilbert', 'コーディ・ヒルベルト'), kana: 'こーでぃ　ひるべると', gender: 'M', wish: 'own', room: 777777, checkIn: 0,
      fate: T(
        `Cody checked in at midnight and wished to own the hotel. He has owned it ever since. He is the boss, and he has not set foot outside his room on the 7th floor once; everything is run by text message. He suggested you have a look around, and he was the one who messaged you at the end.`,
        `コーディ・ヒルベルトは真夜中にチェックインし、ホテルのオーナーになりたいと願い、それ以来このホテルのオーナーとなった。彼こそが「上司」であり、7階の自室から一歩も出ずに、全ての指示をメッセージで送っている。あなたに部屋を見て回るよう勧めたのも、最後にあなたへメッセージを送ったのも、彼だ。`),
    },
    {
      id: 'ruby', name: T('Ruby Finch', '一二三 澪'), kana: 'ひふみ　みお', gender: 'F', wish: 'secrets', room: 3333360, checkIn: 20,
      fate: T(
        `Ruby wished to learn the secrets of the hotel, and suddenly she knew more than anyone should: which rooms sit on which floors, who went up to them, which rooms kill and which send you somewhere else. She wrote down what she could, and left the page in Room 3333360 for whoever came looking.`,
        `一二三澪はホテルの秘密を知りたいと願い、突然誰も知るべきでないことまで知ってしまった。彼女は分かる限り書き留め、探しに来る誰かのために3333360号室に残した。`),
    },
    {
      id: 'levin', name: T('Levin Cook', '竹内 勇'), kana: 'たけうち　いさむ', gender: 'M', wish: 'alone', room: 7777777, checkIn: 13,
      fate: T(
        `Levin wished to be left alone. He rode the elevator up to Floor 8, shut himself in Room 7777777, and has not opened the door since. No housekeeping. No room service. No knocking. Ever.`,
        `竹内勇は誰にも邪魔されないことを願った。エレベーターで8階へ上がり、7777777号室に閉じこもって以来、一度も扉を開けていない。「掃除もいらない。ルームサービスもいらない。ノックもするな。絶対にだ」という、彼の言葉どおりに。`),
    },
    {
      id: 'matthias', name: T('Matthias Meyer', '上田 天馬'), kana: 'うえだ　てんま', gender: 'M', wish: 'god', checkIn: 22,
      // 10^100 sevens, too long to write out. Any all-7 number above
      // 999,999,999 stands in for it: the register takes 0 either way.
      room: '7'.repeat(20),
      roomLabel: T('Room 777…7 (10¹⁰⁰ sevens)', '777…7号室（7が10¹⁰⁰個）'),
      fate: T(
        `Matthias wished to get closer to God. His room number turned out to be more sevens than anyone could ever write, on a floor so high that no elevator will ever reach it. He has been riding the left elevator upward since he checked in last night, and always will be.`,
        `上田天馬は神様に近づきたいと願った。彼の部屋番号は誰にも書ききれないほど7が並ぶ数で、その部屋はどんなエレベーターも辿り着けないほど高い階にあった。昨夜チェックインしてから、彼は左のエレベーターでずっと上昇を続けており、これからも永遠にそうだ。`),
    },
    {
      id: 'kelly', name: T('Kelly Reyes', '坂本 葉月'), kana: 'さかもと　はづき', gender: 'F', wish: 'wrong', room: 6, checkIn: 22,
      fate: T(
        `Kelly wished never to say something wrong again. She hasn't: she can no longer say anything at all.`,
        `坂本葉月は二度と間違ったことを言いたくないと願った。その願いどおり、彼女はあれから一度も間違ったことを言っていない。もう何も話せなくなってしまったからだ。`),
    },
  ];

  // The register also accepts each guest's first name alone: no two guests
  // share one. Japanese names are written family name first ("鈴木 翔太"),
  // katakana ones given name first ("ロバート・ハンセン"). In Japanese, where
  // people are usually called by their family name, that alone counts too,
  // unless two guests share it (the Kimuras). The readings in `kana` count the
  // same way, so a name can be typed in hiragana or katakana instead of kanji
  // (the engine treats katakana and hiragana alike).
  const jaParts = (ja, kana) => {
    const foreign = ja.includes('・');
    const order = parts => (foreign ? parts : parts.reverse());  // → [given, family]
    return { name: order(ja.split(/[・ 　]+/)), kana: kana ? order(kana.split(/[ 　]+/)) : [] };
  };
  const families = {};
  const countFamily = f => { if (f) families[f] = (families[f] || 0) + 1; };
  characters.forEach(c => {
    if (!c.name) return;
    const p = jaParts(c.name.ja, c.kana);
    countFamily(p.name[1]);
    if (p.kana[1] && p.kana[1] !== p.name[1]) countFamily(p.kana[1]);
  });
  characters.forEach(c => {
    if (!c.name) return;
    const p = jaParts(c.name.ja, c.kana);
    c.aliases = (c.aliases || []).concat(T(c.name.en.split(' ')[0], p.name[0]));
    if (families[p.name[1]] === 1) c.aliases.push({ ja: p.name[1] });
    if (c.kana) {
      c.aliases.push({ ja: c.kana }, { ja: p.kana[0] });
      if (families[p.kana[1]] === 1) c.aliases.push({ ja: p.kana[1] });
    }
  });

  // ---------------------------------------------------------------------------
  // Rooms — rules checked in order; every matching rule contributes its text.
  //   match:    number | string | '@charId' | { from, to } | (n, s) => bool | [any of these]
  //   when:     (s) => bool         extra condition (e.g. on deductions)
  //   title:    shown under the room number (in the present and the past)
  //   text:     what the player reads in the present (the CSV's "Now" column)
  //   dialogue: dialogue id (or (s) => id) started after the text
  //   onEnter:  (s) => {}          runs once per visit
  //   final:    true               stop checking later rules
  //   scenes:   what happened here yesterday, seen with the Memory Device.
  //             Keys are hours 7–23, one per column of the CSV (7 is
  //             "7:00 AM", 13 is "1:00 PM", 23 is "11:00 PM"), or ranges
  //             like '9-17'. The device doesn't reach 00–06. An hour with no key is an
  //             empty cell: nothing happened, and its button is grayed out.
  //             Each value is a scene or a list of scenes
  //             [{ title, text, dialogue, onEnter, when }, …], shown in order.
  // Rooms with no matching text fall back to emptyRoom() below.
  // ---------------------------------------------------------------------------
  const rooms = [
    // ===== Floor 0: the common spaces (the CSV's first rows) ==================
    // Lorenzo Conti checks in again on the first visit and every third one after.
    {
      match: 'lobby',
      when: s => s.visits() % 3 === 1,
      text: T(
        `As you approach the check-in desk, someone seems to have just finished checking in.`,
        `フロントに近づくと、ちょうど誰かがチェックインを済ませたところだった。`),
    },
    {
      match: 'lobby',
      text: T(
        // The key card is Chuck Morrison's: he checked into Room 3 and became the receptionist.
        // Cards never show a room number; it is written on the paper sleeve at check-in.
        `You approach the receptionist, a young man in a uniform that looks brand new. Behind the desk, half hidden under the guest book, lies a key card in a paper sleeve. Someone has written "Room 3" on the sleeve.`,
        `フロントには、真新しい制服に身を包んだ若い男性が立っている。カウンターの奥には、紙のケースに入ったカードキーが宿帳の下に半分隠れるようにして置かれている。ケースには手書きで「3号室」と書かれている。`),
      dialogue: 'receptionist',
      onEnter: s => {
        if (s.flag('diningCorpse')) s.set('lobbyAfterCorpse');
        // The corpse report disappears on the first visit after making it.
        if (s.knows('memory')) s.set('reportedCorpse');
      },
      scenes: {
        13: anon(
          `*#1 takes his key card before the receptionist has finished her greeting.*

#1: "No housekeeping. No room service. No knocking. Ever."

*#1 rides the middle elevator alone. The floor indicator above it climbs: 1… 2… 3… and stops at 8.*`,
          `*#1はフロント係が挨拶を言い終える前にカードキーを受け取る。*

#1：「掃除はいらない。ルームサービスもいらない。ノックもするな。絶対にだ」

*#1は一人で中央のエレベーターに乗る。扉の上の階数表示が上がっていく。1……2……3……そして8で止まる。*`),
        20: anon(
          `*The girl at the check-in counter rests her chin on her hand, looking bored. #1 stands at the counter, filling in a check-in form.*

*A woman steps out of the left elevator. A bird is perched on her shoulder. The bird chirps.*

#2: "I know, I know. We'll find you somewhere you can really fly."

*#2 walks out through the front doors.*

#1: "Who was that?"

Receptionist: "Emily, I think. She checked in this afternoon."`,
          `*フロントの若い女性は頬杖をつき、退屈そうにしている。#1はカウンターでチェックイン用紙に記入している。*

*左のエレベーターから女性が降りてくる。肩には小鳥が一羽とまっている。小鳥がさえずる。*

#2：「分かってる、分かってるってば。自由に飛べる場所を見つけてあげるから」

*#2は正面玄関から出ていく。*

#1：「今の人、誰？」

フロント係：「小鳥遊さん……だったと思います。今日の午後にチェックインされた方で」`),
      },
    },
    {
      match: 'dining',
      text: s => {
        const body = T(
          `A man lies dead on the floor. A note lies beside him:

"Behold, my finest work, The Seven Dead Sins, is complete! The Sin of Pride has been executed."`,
          `床には男の死体が横たわっていて、そばにメモが落ちている。

「見よ、我が最高傑作『七つの体罪』は完成した！ 傲慢の罪は執行された。」`);
        if (s.flag('lobbyAfterCorpse')) return body;
        // Until the player has been back to the lobby.
        return T(
          `${body.en}\n\nYou should report this to the receptionist.`,
          `${body.ja}\n\nフロント係に知らせた方がよさそうだ。`);
      },
      onEnter: s => s.set('diningCorpse'),
      scenes: {
        7: anon(
          `#1: "Hi, I just checked in. You don't look so good. Are you okay?"

#2: "NO! I've lost count of how many times I've had this conversation. I've been stuck in this hell for years. Bodies are going to start piling up soon. This afternoon a woman checks in next door and leaves her baby crying all night, and my other neighbor is some chess player who ends up a f**king corpse. GET ME OUT OF HERE!"

#1: "I'll... come back later."`,
          `#1：「どうも、さっきチェックインしたところなんです。顔色が悪いようですけど、大丈夫ですか？」

#2：「大丈夫なわけないでしょ！ この会話、もう何回したか分かんないのよ！ 何年も……何年も、この地獄から抜け出せないの！ もうすぐ死体がどんどん増えていくわ。今日の午後には隣の部屋に女がチェックインして、一晩中赤ん坊を泣かせっぱなし！ もう片方の隣はどこかのチェスプレイヤーで、そいつもどうせ死体になる！ ……クソッ！ ここから出して！」

#1：「また……後で来ます」`),
        8: anon(
          `#1: "This is the best food I've had in my life!"

#2: "Yeah, the food here is awesome. By the way, nice to meet you. I'm Taylor. What's your name?"

#1: "Nice to meet you too. I'm Dominique, a famous food reviewer. If you ever want to talk about food, come find me in Room 40. I'm heading back there now."

*#1 leaves. A moment later, #3 walks in.*

#3: "Morning! Mind if I sit here?"

#2: "…"

#3: "Are you okay? You've gone quiet."

#2: "Sorry! Yes, please, sit. I don't know what's come over me. Until this morning, I'd never have looked twice at a man."

#3: "Is that so? Then today must be my lucky day."`,
          `#1：「こんなうまい料理、生まれて初めて食べたわ！」

#2：「本当、ここの料理は最高ですよね。あ、はじめまして。和泉千尋と言います。あなたは？」

#1：「おう、はじめまして！ 俺は田中博。これでも料理評論家として、ちょっとは名が知れてるんやで。料理の話がしたなったら、いつでも40号室に来てな。ほな、いったん部屋に戻るわ」

*#1が出ていく。少しして、#3が入ってくる。*

#3：「おはよ〜！ ここ、座っていい？」

#2：「……」

#3：「あれ、大丈夫？ 急に黙っちゃってさ」

#2：「あっ、ごめんなさい！ どうぞ、座ってください。自分でもどうしちゃったのか分からなくて……。今朝までは、男の人なんて全然興味なかったのに」

#3：「へえ、マジで？ じゃあ今日の俺、超ラッキーじゃん」`),
        10: anon(
          `#1: "Wow, there's still plenty of food left. Well, can't let it go to waste."

*#1 starts eating.*

*A gunshot rings out.*

*#1 collapses to the floor.*

*A note falls beside the body.*`,
          `#1：「おっ、まだ料理がめっちゃ残ってるわ。もったいないし、食べとかなあかんな」

*#1は食べ始める。*

*銃声が響き渡る。*

*#1は床に崩れ落ちる。*

*遺体のそばにメモがひらりと落ちる。*`),
        12: anon(
          `*A man lies dead on the floor. A note lies beside him:*

"The Sin of Gluttony has been executed."

*#1 arrives and screams after seeing the corpse on the floor.*

#1: "Isn't this... the guy next door? The Sin of Gluttony? What the hell is going on here?! This place is not safe... I need to lock myself in my room."

*#2 and #3 arrive as #1 leaves. A bird flies into the room.*

#2: "Want to hang out in my room after lunch? It's right next to yours."

#3: "Sure, hun. What's that over there... AAAAH!"

#2: "Oh sh*t, it's a body! We should get the lady at the front desk!"

*#2 and #3 leave the room.*`,
          `*床に男が倒れて死んでいる。そばにメモが落ちている。*

「暴食の罪は執行された。」

*#1がやってきて、床の死体を見て悲鳴を上げる。*

#1：「これって……お隣の方ではなくて？ 暴食の罪ですって？ 一体何が起きているんですの！？ ここは安全ではありませんわ……お部屋に閉じこもらなくては」

*#1が出ていくのと入れ違いに、#2と#3がやってくる。小鳥が一羽部屋に飛び込んでくる。*

#2：「ランチのあと、俺の部屋で一緒に過ごさない？ 君の部屋のすぐ隣なんだよね〜」

#3：「いいわよ、ダーリン。あそこにあるのは何……きゃあっ！」

#2：「やばっ！ 死体じゃん！ フロントの女の人呼ばないと！」

*#2と#3は部屋を出ていく。*`),
        14: anon(
          `#1: "Hi, is this seat free? I'm Megan."

#2: "Go ahead. Nice to meet you, Megan. What brings you to the hotel?"

#1: "That's the strange part. I don't remember how I got here. I just woke up in a room upstairs a little while ago."

#2: "You don't remember anything?"

#1: "Not really. I'm sure it'll come back to me."`,
          `#1：「こんにちは、この席空いてますか？ 私、結衣です」

#2：「どうぞ。はじめまして、結衣さん。どうしてこのホテルに？」

#1：「それが不思議なんです。どうやってここに来たのか覚えていなくて。少し前に、上の階の部屋で目が覚めたばかりなんです」

#2：「何も覚えていないんですか？」

#1：「ええ、あまり。でも、そのうち思い出すと思います」`),
        17: anon(
          `*#3 walks in. Heads turn all over the room.*

#1: "No way. Is that… Lisa? It's really her!"

#2: "Lisa! We were watching your stream earlier! You disappeared right in the middle of it. Are you okay?"

#3: "My stream? Oh… yes. I'm fine."

#1: "Happy birthday! I can't believe I get to say that to you in person!"

#3: "Birthday? …Ah. Yes. My birthday. Thank you."

#2: "Can we get a picture with you? We're your biggest fans!"

#3: "Of course! Take as many as you like."`,
          `*#3が入ってくる。部屋中の視線が集まる。*

#1：「うそ。あれって……七海？ 本物だ！」

#2：「七海！ さっき配信を見てたんです！ 途中で急に消えちゃって。大丈夫ですか？」

#3：「配信……？ あ、はい。もう大丈夫です」

#1：「お誕生日おめでとうございます！ 直接言えるなんて信じられない！」

#3：「誕生日……？ ……ああ、はい。そうでした、私の誕生日ですね。ありがとうございます」

#2：「一緒に写真を撮ってもらえますか？ 大ファンなんです！」

#3：「もちろんです！ 好きなだけ撮ってください」`),
        18: anon(
          `*At a corner table, #3 has just sat down to dinner.*

Waiter: "Dinner for Room 2050. Enjoy your meal."

*Meanwhile, #1 and #2 have a conversation.*

#1: "Excuse me. You must be the woman who knows things. A young lady told me about you this afternoon."

#2: "News travels fast. Every hour, something comes to me: something that hasn't happened yet. Usually it's about strangers. But this one…"

*#2 looks at #1 for a long moment.*

#2: "This one is about you. 'You will find who you wish to find in Room 4 at 7pm.'"

#1: "Room 4… at 7 o'clock. After so many years… Thank you. Thank you!"

*#1 hurries out of the dining room.*

*In the corner, #3 is still eating. She has not left her table all hour.*`,
          `*隅のテーブルで#3が夕食の席に着いたところだ。*

ウェイター：「2050号室のお客様、お食事です。ごゆっくりどうぞ」

*その間、#1と#2が言葉を交わしている。*

#1：「失礼。あなたがいろいろなことが*分かる*という方ですね。今日の午後、若い女性から聞きました」

#2：「噂が広まるのは早いのね。一時間ごとに、まだ起きていないことが頭に浮かぶの。たいていは知らない人のことなんだけど、今回のは……」

*#2はしばらく#1を見つめる。*

#2：「今回のはあなたのことよ。『あなたは会いたい人に、19時に4号室で会える』」

#1：「4号室……19時に。何年も経って、ようやく……ありがとう。ありがとう！」

*#1は急いでダイニングルームを出ていく。*

*隅のテーブルでは#3がまだ食事を続けている。この一時間、彼女は一度も席を立っていない。*`),
      },
    },
    {
      match: 'game',
      text: T(
        `You find a man sitting on the sofa. You introduce yourself and ask who he is. He replies:
"I don't know… I think I've lost all my memories. All I remember is that I'm staying in Room 2."`,
        `ソファに男が座っている。自己紹介をして名前を尋ねると、彼はこう答えた。
「分からない……。記憶を全部なくしてしまったみたいなんだ。覚えているのは、2号室に泊まっていることだけだ」`),
      scenes: {
        16: anon(
          `*#1 and #2 are playing chess.*

#1: "Richmond is the greatest chess player of all time. Nobody comes close."

#2: "No argument here. Hansen made it to the world championship final five years in a row and got crushed by him every single time."

*#3 looks up from a game nearby and walks over.*

#3: "Have you looked at the rankings today? As of this afternoon, the number one player in the world is me, Robert Hansen."

#1: "Only because Richmond suddenly dropped off the list today. Beat him first, then we'll talk."

#3: "I don't need to beat a man who isn't there! I'm the best in the world. Me!"

*#3 storms out of the room.*`,
          `*#1と#2がチェスをしている。*

#1：「史上最高のチェスプレイヤーは羽生だよ。誰も足元にも及ばない」

#2：「異議なし。ハンセンなんて五年連続で世界選手権の決勝まで行って、毎回あいつにボロ負けしてるんだから」

*近くで対局していた#3が顔を上げ、歩み寄ってくる。*

#3：「今日のランキングを見てないのか？ 今日の午後の時点で、世界一はこの俺様、ロバート・ハンセンだ！」

#1：「今日になって急に羽生がランキングから消えたからだろ。まずあいつに勝ってから言えよ」

#3：「いない奴に勝つ必要なんかあるか！ 世界一はこの俺様だ。分かったか！」

*#3は部屋を飛び出していく。*`),
        21: anon(
          `*#1, #2, #3 and #4 sit around a mahjong table.*

#1: "Riichi!"

*#1 sets a tile sideways. The table goes quiet.*

*#2 and #3 agonize over every discard, but #4 throws tiles out without even looking.*

#2: "Those tiles look very dangerous. You're really not worried about her riichi?"

#4: "It's fine. I have a feeling she's only waiting on the 3 of bamboo."

#3: "No way. The 6 of bamboo just passed and all copies of the 2 of bamboo are discarded. And two copies of the 3 of bamboo are also on the table. There is no way she is waiting on a single-tile hell wait."

*#3 slams down the 3 of bamboo sideways.*

#3: "Riichi!"

#1: "Ron! 8000."

#4: "I tried to warn you."`,
          `*#1、#2、#3、#4が麻雀をしている。*

#1：「リーチ！」

*#1が牌を横に曲げて置く。卓が静まり返る。*

*#2と#3は一打ごとに頭を抱えているが、#4は余裕そうに牌を切っていく。*

#2：「そんな危ない牌ばかり切って。彼女のリーチが本当に怖くないのか？」

#4：「大丈夫。なんとなく、彼女の待ちは三索だけな気がするんだ」

#3：「まさか。六索はさっき通ったし、二索は全部切れてる。それに三索も場に二枚見えてるんだぞ。三索単騎の地獄待ちなんてあるわけない」

*#3が三索を横向きに叩きつける。*

#3：「リーチ！」

#1：「ロン！ 8000」

#4：「だから言ったのに」`),
        22: anon(
          `*#1, #2 and #3 sit around a poker table. Most of the chips are in front of #1.*

#2: "All in."

#1: "A pair of threes? Brave. I call."

*#2 turns over a pair of threes. #1 shows a pair of fours and wins the pot.*

*#3 stares at #1 in silence.*`,
          `*#1、#2、#3がポーカーテーブルを囲んでいる。チップのほとんどは#1の前にある。*

#2：「オールイン」

#1：「スリーのワンペアで？ 攻めるね。コール」

*#2がスリーのペアを表にする。#1はフォーのペアを見せ、ポットを手に入れる。*

*#3は黙って#1を見つめている。*`),
        23: anon(
          `*Only #1 and #2 are left at the table. #2's chips are stacked high.*

#1: "I'm out. Can I owe you the rest until—"

#2: "Tonight. I'm checking out first thing in the morning. Bring it to Room 1."

#1: "Fine. Fine."

#2: "And don't even think about 'forgetting'."

#1: "…I wasn't going to."`,
          `*テーブルに残っているのは#1と#2だけだ。#2の前にはチップが高く積まれている。*

#1：「もう手持ちがない。残りはツケにしてもらえないか。明日まで――」

#2：「今夜中に頼むよ。明日の朝にチェックアウトするから。1号室まで持ってきて」

#1：「分かった、分かったよ」

#2：「それと、『うっかり忘れる』のはなしだよ」

#1：「……そんなつもりはなかったけど」`),
      },
    },
    {
      match: 'movie',
      text: T(
        `You find a woman watching a movie. You introduce yourself and ask who she is. She says her name is Lisa and she's staying in Room 1729.`,
        `映画を観ている女性がいる。自己紹介をして名前を尋ねると、彼女は七海と名乗り、1729号室に泊まっていると教えてくれた。`),
      scenes: {
        15: anon(
          `*The big screen shows a live stream: "LISA'S BIRTHDAY STREAM". The viewer count is over 30M.*

#1: "30M viewers!? She must be one of the biggest streamers in the world right now."

#2: "Look at the background. It looks like one of the rooms here! Maybe she is here with us."

*On screen, Lisa reads from her chat: "Happy birthday, Lisa! You deserve every—"*

*Mid-sentence, she is gone. The chair is empty. The stream keeps running.*

#1: "…Where did she go?"

#2: "Did the stream glitch?"

*The chat scrolls faster than anyone can read.*`,
          `*大画面には「七海の誕生日配信」のライブ配信が映っていて、視聴者数は3000万人を超えている。*

#1：「3000万人！？ 世界でもトップクラスの配信者なんじゃない？」

#2：「背景を見て。ここの客室みたい！ もしかして、このホテルにいるのかも」

*画面の中で、七海がコメントを読み上げる。「七海、お誕生日おめでとう！ あなたは誰よりも――」*

*言い終わらないうちに彼女は消えていた。椅子は空っぽで、配信だけが続いている。*

#1：「……どこに行ったの？」

#2：「配信がバグった？」

*コメントが誰にも読めない速さで流れていく。*`),
        16: anon(
          `#1: "Mind if I sit? I can't focus on anything today. Have you heard about the bodies?"

#2: "The bodies?"

#1: "I saw a corpse in the dining room at lunch. Then, the love of my life was murdered. I am going to find the killer and avenge him."

#2: "I'm sorry to hear that. I'm afraid I don't know anything that could help. The killer might still be on the loose, so stay safe."

#1: "Thanks, you too. Let me know if you find any leads on who the killer is. I'm in Room 848."

#2: "I'm in Room 486 if you need me."`,
          `#1：「座ってもいいですか？ 今日はどうにも落ち着かなくて。死体の話、聞きました？」

#2：「死体？」

#1：「お昼にダイニングルームで死体を見たんです。それから、私の最愛の人が殺されました。犯人を見つけて、仇を取るつもりです」

#2：「それはお気の毒に。残念ながら、お役に立てそうなことは何も知りません。犯人はまだうろついているかもしれないから、気をつけて」

#1：「ありがとう、あなたも。犯人の手がかりが見つかったら教えてください。私は848号室です」

#2：「何かあれば、私は486号室にいます」`),
        17: anon(
          `*A film plays to a nearly empty room. #1 sits a few seats away from #2, not watching the screen.*

#1: "You haven't looked at the movie once. Is everything okay?"

#2: "Forgive me. I came here to find someone I haven't seen in a very long time, but I still have no idea where they are."

#1: "Then maybe talk to the woman in the common room. She seems to know things before they happen."

#2: "Before they happen?"

#1: "An hour ago she told me 'Alice will go to Wonderland.' Before that, 'Envy will die in Room 8964.' She looked like she believed every word."

#2: "Do you believe her?"

#1: "In this hotel? I'm not ruling anything out."

#2: "If she really sees what's coming… maybe she can tell me where to find who I'm looking for. Thank you, young lady."`,
          `*ほとんど人のいない部屋で映画が流れている。#1は#2から数席離れて座っているが、画面を見ていない。*

#1：「さっきから一度も映画を見ていませんね。大丈夫ですか？」

#2：「失礼。ずいぶん長いあいだ会っていない人を探しに来たんですが、いまだにどこにいるのか見当もつかなくて」

#1：「それなら、談話室にいる女の人と話してみたら？ これから起きることが分かるみたいなの」

#2：「これから起きること？」

#1：「一時間前は『アリスはワンダーランドへ行く』って言ってた。その前は『嫉妬は8964号室で死ぬ』。本気で信じているみたいだった」

#2：「あなたは信じますか？」

#1：「このホテルで？ 何があってもおかしくないと思う」

#2：「もし本当に先のことが見えるなら……私の探している人の居場所も教えてもらえるかもしれない。ありがとう、お嬢さん」`),
      },
    },
    {
      match: 'common',
      text: T(`You find two women here.`, `女性が二人座っている。`),
      dialogue: 'common',
      scenes: {
        11: anon(
          `#1: "Excuse me… aren't you the woman from all those magazine covers? The one who owns that famous jewelry brand?"

#2: "I suppose I am."

#1: "Wait, I just saw this on my phone. The news says you became the richest person in the world this morning. Some deal went through overnight."

#2: "Did it? How nice."

#1: "But… why would someone like you come to a place like this? You already have everything."

#2: "Everything? There is no such thing. That is the difference between us. You are not hungry enough. That is why you are a commoner. And what brings someone like you here?"

#1: "I came here to bring back someone precious I lost..."

#2: "Well, good luck with that. I'll take my leave now."`,
          `#1：「すみません……あなた、よく雑誌の表紙に載っている方ですよね？ あの有名なジュエリーブランドのオーナーの」

#2：「ええ、そうですわ」

#1：「待って、今スマホで見たんですけど。ニュースによると、今朝あなたが世界一の金持ちになったって。一晩で大きな取引がまとまったらしい」

#2：「あら、そうですの。それはよかったですわ」

#1：「でも……どうしてあなたのような人がこんなところに？ もう何もかも持っているじゃないですか」

#2：「何もかも？ そんなもの、ありませんわ。それがあなたとの違いですの。あなたは飢えが足りないのよ。だから庶民なのですわ。それで、あなたのような方がどうしてここに？」

#1：「僕は……失った大切な人を取り戻すために来たんです」

#2：「そう。せいぜい頑張ってくださいな。では、ごきげんよう」`),
        15: anon(
          `#1: "Excuse me. Someone I care about was killed an hour ago. I'm trying to find out who did it. Have you seen anything strange today?"

#2: "I'm sorry. I checked in just before 3 o'clock. But… something strange did happen when I walked into my room. I suddenly knew something. Something that hasn't happened yet."

#1: "What do you mean?"

#2: "Envy will die in Room 8964."

#1: "Envy? The note next to his body said 'Lust'…"

#2: "I don't know what it means either. Oh, and if you want strange: I saw my neighbor talking to a bird. She's probably crazy."

#1: "I'll take anything I can get. If you learn anything else, come find me. I'm in Room 848."

#2: "Room 24. Knock if you need me."`,
          `#1：「すみません。一時間前、大切な人が殺されたんです。犯人を探しています。今日、何か変わったことを見ませんでしたか？」

#2：「お気の毒に。15時ちょっと前にチェックインしたばかりなの。でも……部屋に入ったとき、不思議なことがあったの。急に、まだ起きていないことが分かったの」

#1：「どういうことですか？」

#2：「嫉妬は8964号室で死ぬ」

#1：「嫉妬？ 彼の遺体のそばのメモには『色欲』と……」

#2：「私にも意味は分からないわ。ああ、変わったことといえば、隣の部屋の人が鳥と話しているのを見たわ。たぶん頭がおかしいのね」

#1：「どんなことでも助かります。他に何か分かったら、教えてください。私は848号室にいます」

#2：「私は24号室だよ。用があればノックして」`),
        16: anon(
          `#1: "It happened again."

#2: "What did?"

#1: "Another revelation. An hour ago it was 'Envy will die in Room 8964.' Now it's 'Alice will go to Wonderland.'"

#2: "What does that even mean?"

#1: "I don't know. I only get the words. But for some reason I'm sure that it will happen."`,
          `#1：「また来たの」

#2：「何が？」

#1：「新しい預言よ。一時間前は『嫉妬は8964号室で死ぬ』。今度は『アリスはワンダーランドへ行く』」

#2：「それって、どういう意味？」

#1：「分からない。言葉が浮かぶだけなの。でも、なぜかそれが必ず起きるって分かるの」`),
        17: anon(
          `#1: "There it is again."

#2: "Are you alright? You've gone pale."

#1: "Every hour, something comes to me. Something that hasn't happened yet. Just now it was: 'Sloth will die in Room 2049.'"

#2: "Die? Is this some kind of joke?"

#1: "An hour ago it was 'Alice will go to Wonderland.' Before that, 'Envy will die in Room 8964.' I wish it were a joke."

#2: "…Maybe you should go lie down."`,
          `#1：「また来たわ」

#2：「大丈夫ですか？ 顔色が真っ青ですよ」

#1：「一時間ごとに、まだ起きていないことが頭に浮かぶの。今のは『怠惰は2049号室で死ぬ』」

#2：「死ぬ？ 冗談ですよね？」

#1：「一時間前は『アリスはワンダーランドへ行く』。その前は『嫉妬は8964号室で死ぬ』。冗談だったらよかったのに」

#2：「……少し横になった方がいいですよ」`),
        19: anon(
          `#1: "There you are. I went to Room 8964. You were right. Envy is dead."

#2: "I know. I've stopped hoping I'm wrong. I just received the next one. 'Wrath will die in Room 8484.'"

#1: "Another one of the seven deadly sins. Looks like the killer is still on the loose."

#2: "Please be careful."

#1: "Thank you. I know what I have to do."

*#1 leaves, fists clenched.*`,
          `#1：「ここにいたんですね。8964号室に行ってきました。あなたの言った通りでした。嫉妬は死んでいました」

#2：「知ってる。もう、外れてほしいとは思わなくなったわ。ちょうど次のが来たところよ。『憤怒は8484号室で死ぬ』」

#1：「また七つの大罪の一つ。犯人はまだうろついているみたいですね」

#2：「どうか気をつけて」

#1：「ありがとう。自分が何をすべきか、分かっています」

*#1は拳を握りしめて去っていく。*`),
        20: anon(
          `*#1 sits alone by the window. Suddenly, she goes rigid.*

#1: "'The prophet will die at midnight.'"

*The color drains from her face.*

#1: "No… no, no, no."

*#1 hurries out toward the elevators.*`,
          `*#1が窓際に一人で座っている。突然、彼女の体が強張る。*

#1：「『預言者は真夜中に死ぬ』」

*彼女の顔からみるみる血の気が引いていく。*

#1：「うそ……いや、いや、いや」

*#1はエレベーターの方へ急いで出ていく。*`),
      },
    },

    // ===== Floor 1: Room 1, beside the elevators ===============================
    {
      match: 1,
      text: T(
        `Room 1, at the very head of the corridor. The corridor runs away from you, door after door, farther than you can see. Across from Room 1, three elevators stand side by side.`,
        `1号室は廊下の一番端にある。廊下には扉がずらりと並び、その先は見えなくなるまで続いている。向かい側にはエレベーターが三台ある。`),
    },

    // ===== Guest rooms (the CSV's remaining rows) ==============================
    {
      match: '@caleb',
      text: T(
        `You knock on the door. A woman answers. After talking for a while, you learn that her name is Megan and she has no idea how she got here.`,
        `ドアをノックすると女性が出てきた。少し話してみると、彼女は結衣という名前で、どうやってここに来たのか全く覚えていないらしい。`),
    },
    { match: '@nigel', text: LOCKED },
    { match: '@chuck', text: LOCKED },
    {
      match: '@sophia',
      text: T(
        `You open the door.
You discover the corpses of an old man and a young woman. The young woman seems to have hanged herself.
You find a piece of paper that reads: "Your target will arrive at 7pm."`,
        `ドアを開けると、年配の男性と若い女性が死んでいた。女性は首を吊ったようだ。
そばには「ターゲットは19時に到着する」と書かれた紙が落ちている。`),
      scenes: {
        19: anon(
          `*#1 sits on the edge of the bed with a gun in her lap, watching the door.*

*A knock.*

#2: "Hello? I was told I'd find someone here…"

*The door opens. A gunshot. #2 falls to the floor.*

*#1 kneels to check the body, then sees his face.*

#1: "…Dad? DAD!"

*Later, the room is silent. #1 has hanged herself.*`,
          `*#1がベッドの端に腰かけ、膝に拳銃を置いて扉を見つめている。*

*ノックの音。*

#2：「こんばんは。ここで会えると言われて……」

*扉が開く。銃声。#2が床に倒れる。*

*#1は遺体を確かめようとひざまずき、そして彼の顔を見る。*

#1：「……お父さん？ お父さん！」

*しばらくして、部屋は静まり返っている。#1は首を吊っていた。*`),
      },
    },
    {
      match: '@mark',
      text: T(
        `You open the door and find a suitcase with the name tag "Mark Zhang".`,
        `ドアを開けると、「青木大輔」というネームタグのついたスーツケースが置いてあった。`),
    },
    { match: '@philip', text: NOTHING },
    { match: '@gabriel', text: NOTHING },
    { match: '@serena', text: T(`A woman lies dead on the floor.`, `床には女性の死体が横たわっている。`) },
    {
      // Emily left with the bird; this marks 25 (not 23) as Serena's neighbor.
      match: '@emily',
      text: T(
        `A few small feathers are scattered across the windowsill.`,
        `窓辺に小さな羽が数枚落ちている。`),
    },
    {
      match: '@dominique',
      text: NOTHING,
      scenes: {
        9: anon(
          `#1: "Oh, hello there, neighbor! Just checked in?"

#2: "Yes. I haven't even seen my room yet."

#1: "Then you're in for a treat. Have you tried the breakfast? It's the best food I've ever tasted, and I've tasted a lot."

#2: "I'll pass. I didn't come here for the food."

#1: "Your loss! Once breakfast is over, I'm going back down to see if they have any leftovers."

#2: "Enjoy."

*She closes the door behind her.*`,
          `#1：「おっ、お隣さん！ チェックインしたばっかりなん？」

#2：「ええ。まだお部屋も見ていませんの」

#1：「楽しみやな！ 朝飯はもう食べた？ 今まで食べた中で一番うまかったわ。これでも色んなもん食べてきたんやけどな」

#2：「遠慮しておきますわ。食事のために来たわけではありませんもの」

#1：「もったいないなあ！ 朝飯の時間が終わったら、残りもんがないか見に行くか」

#2：「せいぜいお楽しみなさいな」

*彼女は扉を閉めた。*`),
      },
    },
    {
      match: '@helen',
      text: sinNote('woman', 'Greed', '強欲'),
      scenes: {
        13: anon(
          `*#1 rushes into the room.*

*A gunshot rings out.*

*#1 collapses to the floor.*

*A note falls beside the body.*`,
          `*#1が部屋に駆け込む。*

*銃声が響き渡る。*

*#1は床に崩れ落ちる。*

*遺体のそばにメモがひらりと落ちる。*`),
      },
    },
    // Aida's room, where the game proper begins (startRoom).
    {
      match: '@aida',
      text: T(
        `A woman has just stepped out of Room 76 and is pulling the door shut behind her.`,
        `76号室から女性が出てきたところで、ドアを閉めている。`),
      dialogue: 'aida',
    },
    { match: '@you', text: NOTHING },
    { match: '@lorenzo', text: NOTHING },
    { match: '@alice', text: NOTHING },
    { match: '@taylor', text: NOTHING },
    {
      match: '@jacob',
      text: sinNote('man', 'Lust', '色欲'),
      scenes: {
        14: anon(
          `#1: "I need to get something from my room. I'll be back in a minute."

#2: "Okay, hun."

*#1 leaves the room.*

*A gunshot rings out.*

*#2 collapses to the floor.*

*A note falls beside the body.*

*#1 enters the room and screams.*`,
          `#1：「部屋に取りに行きたいものがあるの。すぐ戻るわ」

#2：「りょーかい、ハニー」

*#1が部屋を出ていく。*

*銃声が響き渡る。*

*#2は床に崩れ落ちる。*

*遺体のそばにメモがひらりと落ちる。*

*#1が部屋に入ってきて、悲鳴を上げる。*`),
      },
    },
    {
      match: '@lisa',
      text: T(
        `A small birthday cake sits untouched beside a computer.`,
        `パソコンの横に手付かずの小さなバースデーケーキが置かれている。`),
      scenes: {
        15: anon(
          `*A woman sits at a desk in front of a camera. A small birthday cake sits beside her keyboard.*

#1: "Thirty million viewers on my birthday! I can't believe it. This is literally a dream come true."

#1: "Okay, let me read some messages. This one says: 'Happy birthday, Lisa! You deserve every—'"

*Mid-sentence, she is gone.*

*On the monitor, the chat scrolls faster and faster.*`,
          `*カメラの前の机に女性が座っていて、キーボードの横には小さなバースデーケーキが置かれている。*

#1：「誕生日に3000万人とか、マジでやばくない！？ 信じらんないんだけど！ ガチで夢叶ったわ〜」

#1：「じゃ、コメント読んでくね〜。これは……『七海、お誕生日おめでとう！ あなたは誰よりも――』」

*言い終わらないうちに彼女は消えていた。*

*モニターの中でコメントがどんどん速く流れていく。*`),
      },
    },
    { match: '@jessica', text: LOCKED },
    {
      match: '@jones',
      text: sinNote('man', 'Sloth', '怠惰'),
      scenes: {
        18: anon(
          `#1: "I can now stay here forever and not work anymore for the rest of my life!"

*#1 enters the room.*

*A gunshot rings out.*

*#1 collapses to the floor.*

*A note falls beside the body.*`,
          `#1：「これでずっとここにいられる。もう一生働かなくていいんだ！」

*#1が部屋に入る。*

*銃声が響き渡る。*

*#1は床に崩れ落ちる。*

*遺体のそばにメモがひらりと落ちる。*`),
      },
    },
    { match: '@marie', text: LOCKED },
    {
      match: '@victor',
      text: sinNote('woman', 'Wrath', '憤怒'),
      scenes: {
        20: anon(
          `*The sound of the door unlocking and opening can be heard. The door closes soon after. No lock clicks.*

*#1 arrives in front of the room.*

*#1 bursts into the room holding a knife.*

*A gunshot rings out.*

*#1 collapses to the floor.*

*A note falls beside the body.*`,
          `*鍵が開き、扉が開く音が聞こえる。扉はすぐにまた閉まる。鍵をかける音はしない。*

*#1が部屋の前にやってくる。*

*#1がナイフを握りしめて部屋に飛び込む。*

*銃声が響き渡る。*

*#1は床に崩れ落ちる。*

*遺体のそばにメモがひらりと落ちる。*`),
      },
    },
    {
      match: '@polina',
      text: T(
        `The room is locked. You hear the faint sound of a baby crying through the door.`,
        `部屋には鍵がかかっている。扉の向こうから、かすかに赤ん坊の泣き声が聞こえる。`),
    },
    { match: '@lucy', text: NOTHING },
    {
      match: '@robert',
      text: sinNote('man', 'Envy', '嫉妬'),
      scenes: {
        17: anon(
          `*#1 enters the room.*

*A gunshot rings out.*

*#1 collapses to the floor.*

*A note falls beside the body.*

*The sound of a baby crying can be faintly heard.*`,
          `*#1が部屋に入る。*

*銃声が響き渡る。*

*#1は床に崩れ落ちる。*

*遺体のそばにメモがひらりと落ちる。*

*かすかに赤ん坊の泣き声が聞こえる。*`),
      },
    },
    {
      match: '@ruby',
      ...pickUp('secrets', T(
        `You find a sheet of paper titled 'Secrets of the Hotel' and take it with you.`,
        `「ホテルの秘密」と題された紙を見つけ、持っていくことにした。`)),
    },
    { match: '@kelly', text: LOCKED },
    // Cody, Levin and Matthias live on all-7 floors the player can't reach, so
    // their rooms have no text.
  ];

  // ---------------------------------------------------------------------------
  // Fallback for every room without authored text: the same line as the
  // guest rooms with nothing to find.
  // ---------------------------------------------------------------------------
  function emptyRoom(s) {
    return NOTHING[s.lang] || NOTHING.en;
  }

  // ---------------------------------------------------------------------------
  // Dialogues
  //   start: node id or (s) => node id
  //   nodes: { id: { speaker, text, do(s), next, end, choices: [ { text, next, when(s), do(s), once } ] } }
  // A node without choices shows "Continue" if it has `next` (or jumps straight
  // to it when that node has no text, i.e. a menu); otherwise the dialogue ends.
  // Effects in `do` may run again on revisits, so keep them idempotent
  // (s.set(...), s.note(text, id) with an id, ...).
  // ---------------------------------------------------------------------------
  const dialogues = {
    // Aida Long, in Room 76, where the game proper begins.
    aida: {
      speaker: s => (s.flag('metAida') ? T('Aida Long', '中藤 理亜') : T('Woman', '女性')),
      start: 'menu',
      nodes: {
        menu: {
          choices: [
            { text: T('What\'s your name?', 'お名前は？'), next: 'name', do: s => s.set('metAida') },
            { text: T('Where is this place?', 'ここはどこですか？'), next: 'where' },
            {
              text: T('If you don\'t mind, can you tell me what your wish was?', 'どんな願いをしたのか教えてもらえますか？'),
              next: 'wish',
            },
          ],
        },
        name: {
          text: T(
            `Hi, my name is Aida! I hope I can be helpful to you today.`,
            `こんにちは！ 私は中藤理亜。今日はあなたの役に立てたらうれしいな。`),
          next: 'menu',
        },
        where: {
          text: T(
            `This is Hilbert's Hotel, a place that makes dreams come true. The receptionist at the front desk can tell you more. Go ahead and use the warp device outside my room to go to Room 1, where you can access the elevator to the lobby.`,
            `ここはヒルベルト・ホテル。どんな夢も叶えてくれる場所よ。詳しいことはフロント係に聞いてみて。部屋の前のワープ装置で1号室まで行けば、そこからエレベーターでロビーに下りられるわ。`),
          next: 'menu',
        },
        wish: {
          text: T(
            `I wish that I was able to help you today!`,
            `あなたの役に立てますようにって願ったの！`),
          next: 'menu',
        },
      },
    },

    // Marie Sinclair and Kelly Reyes in the Common Room. Both lines are narrated.
    common: {
      speaker: '',
      start: 'menu',
      nodes: {
        menu: {
          choices: [
            { text: T('Introduce yourself to the first woman', '一人目の女性に自己紹介する'), next: 'marie' },
            { text: T('Introduce yourself to the second woman', '二人目の女性に自己紹介する'), next: 'kelly' },
          ],
        },
        marie: {
          text: T(
            `She introduces herself as Marie. She warns you that this hotel may be dangerous: she heard a gunshot from the room next to hers around 6pm yesterday.`,
            `彼女は白石美月と名乗り、このホテルは危ないかもしれないと忠告してくれた。昨日の18時ごろ、隣の部屋から銃声が聞こえたらしい。`),
          next: 'menu',
        },
        kelly: {
          text: T(
            `She gestures that she can't speak. Then she writes something in a notebook and holds it up for you: "Kelly, Room 6."`,
            `彼女は身振りで、話せないことを伝えてきた。そして手帳に何か書くと、こちらに見せてくれた。「坂本葉月　6号室」`),
          next: 'menu',
        },
      },
    },

    // The receptionist at the check-in desk in the lobby. She hands over the
    // Memory Device once the player reports the body in the dining room, the
    // Check-in List at 6 confirmed guests, and a last lead at 18.
    receptionist: {
      speaker: T('Receptionist', 'フロント係'),
      start: 'menu',
      nodes: {
        menu: {
          choices: [
            { text: T('Can you tell me about this hotel?', 'このホテルについて教えてもらえますか？'), next: 'hotel' },
            // Shown from finding the body until the visit after reporting it.
            {
              text: T('There is a corpse in the dining room!', 'ダイニングルームに死体があります！'),
              next: 'corpse',
              when: s => s.flag('diningCorpse') && !s.flag('reportedCorpse'),
            },
            // Takes its place afterwards, so the lead to Rooms 4, 5 and 14 can be heard again.
            {
              text: T('Where should I start looking?', 'どこから調べればいいですか？'),
              next: 'lead',
              when: s => s.flag('reportedCorpse'),
            },
            { text: T('Who is your boss?', 'あなたの上司は誰ですか？'), next: 'boss' },
            {
              text: T('I have identified 6 guests.', 'お客様を6人特定しました。'),
              next: 'six',
              when: s => s.confirmedCount() >= 6 && !s.hasPaper('checkin'),
            },
            {
              text: T('I have identified 18 guests.', 'お客様を18人特定しました。'),
              next: 'eighteen',
              when: s => s.confirmedCount() >= 18 && !s.flag('told18'),
            },
          ],
        },
        hotel: {
          text: T(
            `Sure. At Hilbert's Hotel, we grant every wish. Just tell us your wish at check-in and go to your room, and it will be granted. We have infinitely many rooms. Tap your key card in the elevator and it takes you to your floor. A warp device outside every room takes you instantly to any other room on the same floor. The dining room and other facilities are on this floor.

Sorry, I just started this job recently. There are no shifts here and I'm the only one on the desk, so there's been nobody to show me the ropes. That's about all I know so far.`,
            `もちろんです。ヒルベルト・ホテルでは、どんな願いも叶えてさしあげます。チェックインの際に願いをお伝えいただき、お部屋に入れば、その願いが叶います。客室は無限にございます。エレベーターでカードキーをかざせば、お部屋のある階へ参ります。各部屋の前にあるワープ装置で、同じ階のどの部屋の前へも一瞬で移動できます。ダイニングルームなどの施設はこの階にございます。

申し訳ございません、最近この仕事を始めたばかりでして。ここには交代のシフトもなく、フロント係は私一人ですので、教えてくれる人もおらず……。今お伝えできるのはこれくらいです。`),
          next: 'menu',
        },
        corpse: {
          text: T(
            `Not another one… My boss says you're doing some detective work here. Take this Memory Device: it lets you replay scenes from yesterday. Come back once you've correctly identified 6 guests.

The boss suggests going to Rooms 4, 5 and 14.`,
            `またですか……。昨日も人が死んだと聞きました。あなたが探偵のようなことをなさっていると、上司から伺っております。こちらの記憶装置をお使いください。昨日の出来事を再生できます。お客様を6人正しく特定できたら、またいらしてください。

上司からは、4号室、5号室、14号室を調べてみるよう言付かっております。`),
          do: s => {
            s.learn('memory');
            s.note(T('Receptionist: the boss suggests going to Rooms 4, 5 and 14.', 'フロント係：上司によれば、4号室、5号室、14号室を調べてみるとよい。'), 'lead-4-5-14');
          },
          next: 'gotMemory',
        },
        gotMemory: {
          speaker: '',
          text: T(`*You are given a Memory Device.*`, `*記憶装置を受け取った。*`),
          next: 'menu',
        },
        lead: {
          text: T(
            `The boss suggests going to Rooms 4, 5 and 14.`,
            `上司からは、4号室、5号室、14号室を調べてみるよう言付かっております。`),
          next: 'menu',
        },
        boss: {
          text: T(
            `The owner of this hotel. I hear he lives on the 7th floor, but he's very secretive. I've never met him in person; he only sends instructions by text.`,
            `このホテルのオーナーです。7階にお住まいだと聞いておりますが、とても秘密主義な方で、直接お会いしたことはございません。指示はいつもメッセージで届きます。`),
          next: 'menu',
        },
        six: {
          text: T(
            `It seems I underestimated your detective skills. I recovered the list of yesterday's check-ins and their times. Come back once you've identified 18 guests.`,
            `どうやら、あなたの探偵としての腕を見くびっていたようです。昨日のチェックイン記録を、時刻とあわせて復元しました。お客様を18人特定できたら、またいらしてください。`),
          do: s => s.give('checkin'),
          next: 'gotList',
        },
        gotList: {
          speaker: '',
          text: T(`*You are given a Check-in List.*`, `*チェックイン一覧を受け取った。*`),
          next: 'menu',
        },
        eighteen: {
          text: T(
            `Nice work! The boss told me that someone might have left something interesting behind at Room 3333360. Good luck with the rest of the investigation.`,
            `お見事です！ 上司の話では、3333360号室に誰かが何か面白いものを残していったかもしれないとのことです。残りの調査も頑張ってください。`),
          do: s => {
            s.set('told18');
            s.note(T('Receptionist: someone might have left something interesting in Room 3333360.', 'フロント係：3333360号室に誰かが何か面白いものを残していったかもしれない。'), 'lead-3333360');
          },
          next: 'menu',
        },
      },
    },
  };

  // ---------------------------------------------------------------------------
  // Papers built from the characters
  // ---------------------------------------------------------------------------
  const GENDER = { M: T('M', '男'), F: T('F', '女') };

  // The Guest List: every guest but the player, alphabetically so the order
  // gives nothing away (in Japanese, by the reading in `kana`), with their
  // gender. In Japanese, a name in kanji also shows its reading.
  const hasKanji = s => /[一-鿿々]/.test(s);
  const guestList = lang => characters.filter(c => !c.player)
    .map(c => ({
      name: c.name[lang],
      reading: lang === 'ja' && c.kana && hasKanji(c.name.ja) ? c.kana : '',
      key: lang === 'ja' && c.kana ? c.kana : c.name[lang],
      gender: GENDER[c.gender] ? GENDER[c.gender][lang] : '',
    }))
    .sort((a, b) => a.key.localeCompare(b.key, lang))
    .map(g => (lang === 'ja'
      ? `• ${g.name}${g.reading ? `（${g.reading}）` : ''}${g.gender ? `（${g.gender}）` : ''}`
      : `• ${g.name}${g.gender ? ` (${g.gender})` : ''}`))
    .join('\n');

  // The Check-in List: one line per hour, naming everyone who checked in
  // during that hour, alphabetically.
  const hourLabel = { en: h => `${String(h).padStart(2, '0')}:00`, ja: h => `${h}時台` };
  const checkIns = lang => {
    const byHour = {};
    characters.forEach(c => [].concat(c.checkIn === undefined ? [] : c.checkIn)
      .forEach(h => (byHour[h] = byHour[h] || []).push({ name: c.name[lang], key: lang === 'ja' && c.kana ? c.kana : c.name[lang] })));
    return Object.keys(byHour).map(Number).sort((a, b) => a - b)
      .map(h => `${hourLabel[lang](h)} — ${byHour[h].sort((a, b) => a.key.localeCompare(b.key, lang)).map(e => e.name).join(lang === 'ja' ? '、' : ', ')}`)
      .join('\n');
  };

  // ---------------------------------------------------------------------------
  // Put it all together
  // ---------------------------------------------------------------------------
  HOTEL.define({
    id: 'hilbert-mysterious-hotel-v1',   // change to start everyone with a fresh save
    title: T('Hilbert\'s Mysterious Hotel', 'ヒルベルトの不思議なホテル'),
    startRoom: 76,            // Aida Long's room: where the game proper begins, after the prologue

    // Shown on the home screen, under the language buttons.
    homeNote: T(
      `The story, scenario and mystery of this game are the author's original work. AI assistance was used only to build the interface and to help with editing and translation, and the author reviewed and revised everything it produced.`,
      `本作のストーリー、シナリオ、謎解きは、すべて作者によるオリジナルです。AIはUIの制作と文章の推敲・翻訳の補助にのみ使用しており、生成された内容はすべて作者が確認・修正しています。`),
    confirmBatch: 3,
    debug: false,             // true shows the debug buttons (for testing); false for release

    // Extra buttons in the top bar while debugging.
    debugActions: [
      {
        label: T('Dbg: Check-ins', 'Dbg: チェックイン'),
        run: s => s.give('checkin'),
        done: s => s.hasPaper('checkin'),
      },
      {
        // Fills every register row with its answer, which confirms them all
        // and opens the ending. Temporary: for checking the ending and fates.
        label: T('Dbg: Solve all', 'Dbg: 全員解決'),
        run: () => HOTEL.debug.solveAll(),
        done: s => s.confirmedCount() >= characters.length,
      },
    ],

    // Played once, after Start Game, on a page of its own. Steps:
    //   { speaker, text }        a line
    //   { ask: 'name', text }    asks the player's name ({player} in any text)
    //   { give: paperId, text }  hands over a paper (shown as an Inventory card)
    //   { read: paperId, text }  shows a paper's whole text on the page
    // Each step's paragraphs (split by blank lines) appear one at a time,
    // each when the player clicks.
    prologue: [
      {
        ask: 'name',
        text: T(
          `Welcome to Hilbert's Hotel. May I have your name?`,
          `ヒルベルト・ホテルへようこそ。お名前をうかがってもよろしいですか？`),
      },
      {
        give: 'instructions',
        text: T(
          `"Thank you, {player}. Next, could you tell me yo—"

RIIIIIIIING

You jolt awake to the sound of your phone alarm. Looking around, you find a few sheets of paper on the desk.`,
          `「ありがとうございます、{player}様。では次に、あなたの――」

ジリリリリリリ！

スマホのアラーム音であなたは飛び起きた。あたりを見回すと、机の上に何枚かの紙が置いてある。`),
      },
      {
        // The Instructions in full, so the register makes sense before Aida.
        read: 'instructions',
        text: T(
          `The sheet on top is headed *Instructions*. You read it carefully.`,
          `一番上の紙には「指示書」と書かれている。あなたはそれをじっくりと読んだ。`),
      },
      {
        // The player's key card. No number on it, so it doesn't give away Room 78.
        give: 'card',
        text: T(
          `Under the papers lies a key card stamped with the hotel's crest. You turn it over. There's no room number on it.`,
          `紙の下には、ホテルの紋章が入ったカードキーがあった。裏返してみたが、部屋番号はどこにも書かれていない。`),
      },
      {
        // The room to the left is Aida's 76, which hints that the player's is 78
        // (77 is not on Floor 1).
        text: T(
          `You step out of your room into the corridor and almost bump into a woman coming out of the room to your left.`,
          `部屋を出て廊下に足を踏み出したとたん、左隣の部屋から出てきた女性とぶつかりそうになった。`),
      },
    ],

    // The Hints tab. A placeholder for now; give it text (or s => text) later.
    hints: T('Hints will be added in the future.', 'ヒントは今後追加される予定です。'),

    // Shown once every row of the register is confirmed. The boss only ever
    // sends messages (see the receptionist's "Who is your boss?").
    ending: T(
      `You fill in the last line, and the register is finally complete.

Your phone buzzes. It's a message from an unknown number:

*"Splendid work. Every wish in this hotel is granted, one way or another. Yours too, I hope.*

*Did you have fun?"*`,
      `最後の一行を書き終え、宿帳はついに完成した。

スマホが震える。知らない番号からのメッセージだ。

*「お見事だ。このホテルでは、どんな願いも何らかの形で叶う。君の願いも叶っているといいのだが。*

*楽しんでもらえただろうか？」*`),

    // The screen of fates, opened from the ending (and from the top bar after
    // clearing). Each guest's `fate` is listed under their name.
    fates: {
      intro: T(
        `Here is what became of every guest who checked in yesterday, and how each of their wishes came true.`,
        `昨日チェックインしたお客様一人一人に何が起き、その願いがどのように叶えられたのかをここに記す。`),
    },

    // Every numbered room is on Floor 1, except rooms made only of 7s:
    // Room 7 is on Floor 2, Room 77 on Floor 3, Room 777 on Floor 4, …
    // Floor 0 holds the named places below and no numbered rooms.
    floors: {
      of: n => (/^7+$/.test(n.toString()) ? n.toString().length + 1 : 1),
      numbered: f => f !== 0,
    },

    // Named, unnumbered places. Players reach them by button, not by number;
    // room rules match them by id, e.g. { match: 'dining', ... }.
    places: [
      { id: 'lobby',  name: T('Lobby', 'ロビー'),                floor: 0 },
      { id: 'dining', name: T('Dining Room', 'ダイニングルーム'), floor: 0 },
      { id: 'game',   name: T('Game Room', 'ゲームルーム'),       floor: 0 },
      { id: 'movie',  name: T('Movie Room', 'シアタールーム'),    floor: 0 },
      { id: 'common', name: T('Common Room', '談話室'),           floor: 0 },
    ],

    // The only way between floors. Tapping a key card takes a guest to the
    // floor their room is on; without one, the elevator goes to Floor 0. The
    // player's card (which, like every card here, shows no number) is for Room 78, on Floor 1, so from the lobby they tap it
    // and go up, and from Room 1 they ride down without it. The player never
    // gets the left car: Matthias Meyer is riding it up to his room, forever.
    elevators: {
      at: [1, 'lobby'],
      cars: [
        { name: T('left elevator', '左のエレベーター') },
        { name: T('middle elevator', '中央のエレベーター') },
        { name: T('right elevator', '右のエレベーター') },
      ],
      board: () => 1 + Math.floor(Math.random() * 2),  // middle or right, evenly
      to: s => (s.floor === 0 ? 1 : 0),
      inside: (s, to) => {
        const ride = to === 0
          ? T(`Beside the doors is a panel for tapping a key card. You don't tap anything, and the elevator goes down to Floor 0.`,
            `扉の横にカードキーをかざすパネルがある。何もかざさずにいると、エレベーターは0階へ降りていった。`)
          : T(`Beside the doors is a panel for tapping a key card. You tap your key card, and the elevator takes you to Floor 1.`,
            `扉の横にカードキーをかざすパネルがある。自分のカードキーをかざすと、エレベーターは1階へ上がっていった。`);
        // Matthias has been riding the left car up since 10 PM (and still is).
        // By now its floor number has outgrown the indicator: a hint that his
        // room is huge enough to write as 0.
        const past = s.at !== null && s.at !== undefined;
        if (past && s.at < 22) return ride;
        const left = past
          ? T(`The left elevator is in use. The indicator above it is lit, its number climbing steadily.`,
            `左のエレベーターは使用されている。その上の表示灯がともり、数字が着々と増えていく。`)
          : T(`The left elevator is in use. The indicator above it is lit, its number already too long for the display.`,
            `左のエレベーターは使用されている。その上の表示灯はともっているが、数字はもう表示しきれないほど長くなっている。`);
        return T(`${left.en}\n\n${ride.en}`, `${left.ja}\n\n${ride.ja}`);
      },
      landing: f => (f === 0 ? 'lobby' : f === 1 ? 1 : '7'.repeat(f - 1)),  // where the doors open
    },

    // Papers the player carries, shown in the notebook's Inventory. Papers are
    // held from the start unless { start: false }; hand those over with
    // s.give(id) or a prologue step's `give`.
    papers: [
      {
        id: 'instructions',
        title: T('Instructions', '指示書'),
        start: false,  // found in the prologue
        text: T(
          `Welcome to Hilbert's Hotel, where every wish is granted.

We hear you enjoy a good mystery, so we have prepared one for you. Yesterday, a number of guests checked into this hotel. Can you work out each guest's name, wish and room number?

Write your answers in the **Register**: one row per guest, filled in any order. A room numbered above 999,999,999 may simply be written as 0.

The register checks your answers three at a time: whenever three rows are correct, it confirms them together.

Should anything you read catch your eye, select the text to copy it into your notes.`,
          `ヒルベルト・ホテルへようこそ。当ホテルでは、どんな願いも叶えてさしあげます。

謎解きがお好きだと伺いましたので、一つご用意いたしました。昨日、このホテルには何人ものお客様がチェックインされました。それぞれのお客様の名前、願い、部屋番号を突き止められるでしょうか？

答えは **宿帳** にお書きください。お客様一人につき一行で、どの行から埋めてもかまいません。999,999,999より大きい部屋番号は0と書いてください。

宿帳は三件ずつ答え合わせをいたします。正しい行が三つそろうたびに、まとめて確定されます。

気になる文章があれば、選択するだけでメモに書き写すことができます。`),
      },
      {
        id: 'card',
        title: T('Key Card', 'カードキー'),
        start: false,  // found in the prologue
        text: T(
          `Your room's key card, black with the hotel's crest in gold. Like most hotel key cards, it shows no room number anywhere, so a lost card can't lead anyone to your door.`,
          `自分の部屋のカードキー。黒地に金色でホテルの紋章が入っている。多くのホテルのカードキーと同じく、部屋番号はどこにも書かれていない。落としても、どの部屋の鍵なのか誰にも分からないようになっているのだ。`),
      },
      {
        id: 'names',
        title: T('Guest List', '宿泊客名簿'),
        text: () => T(guestList('en'), guestList('ja')),
      },
      { id: 'wishes', title: T('List of Wishes', '願いの一覧') },
      {
        id: 'checkin',
        title: T('Check-in List', 'チェックイン一覧'),
        start: false,  // the receptionist hands it over once 6 guests are confirmed
        text: () => T(
          `Yesterday's check-ins at the front desk, by hour. Times are not exact: a guest listed at 11:00 checked in at some point between 11:00 and 11:59.\n\n${checkIns('en')}`,
          `昨日チェックインされたお客様の一覧です。時刻は正確ではありません。たとえば「11時台」のお客様は、11時00分から11時59分のあいだにチェックインされています。\n\n${checkIns('ja')}`),
      },
      {
        id: 'secrets',
        title: T('Secrets of the Hotel', 'ホテルの秘密'),
        start: false,  // found in Ruby Finch's room
        text: T(
          `- Some rooms are not on the first floor. Room 7 is on Floor 2, Room 77 is on Floor 3, Room 777 on Floor 4, and so on…

- Someone has been up on the 7th floor since midnight.

- Room 444 has seen death after death today.

- Room 666 has the power to transport someone to another world.

- Someone suddenly disappeared in Room 1214 earlier today.

- Your check-in room determines whether you can leave the hotel alive.
`,
          `- このホテルの他の階にも部屋がある。7号室は2階、77号室は3階、777号室は4階にある。

- 誰かが真夜中からずっと7階にいる。

- 444号室では今日、死が何度も繰り返されている。

- 666号室には、人を異世界に転移させる力がある。

- 今日、1214号室で誰かが忽然と姿を消した。

- チェックインする部屋によって、生きてホテルを出られるかどうかが決まります。  
`),
      },
    ],

    // The Memory Device (skill 'memory'): yesterday's scenes, one hour at a
    // time from `from` o'clock to `to` o'clock, in every room except those in
    // `except`. Hours with no scenes in a room are grayed out.
    memory: {
      from: 7,
      to: 23,
      except: [],
      empty: T(
        `The Memory Device does not respond.`,
        `記憶装置は反応しない。`),
    },

    // Abilities and items the player gets with s.learn(id). Getting one shows
    // a toast ("Obtained" for `item: true`). An item goes in the Inventory
    // with its `text`; any other skill's `text` goes in the Notes tab.
    skills: {
      memory: {
        name: T('Memory Device', '記憶装置'),
        item: true,
        text: T(
          `In any room, choose an hour of yesterday (07–23) from the row above the room number field to see what happened there during that hour. Hours with nothing to see are dimmed. **Back to the present** returns you to the room as it is now.`,
          `どの部屋でも、部屋番号の欄の上に並ぶ昨日の時刻（7〜23時）を選ぶと、その一時間にそこで起きたことが見られる。見るものがない時刻は薄く表示される。**現在に戻る** を押すと、今の部屋に戻る。`),
      },
    },

    wishes,
    characters,
    rooms,
    emptyRoom,
    dialogues,
  });
})();
