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
 * Markup: blank line = new paragraph, *italic*, **bold**, ~~struck~~, %%grayed out%%.
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

  // A cell that is still a sketch. Shown as-is (in English) in both languages,
  // unless a Japanese sketch is given too.
  const draft = (sketch, ja = sketch) => T(`✎ *Draft:* ${sketch}`, `✎ *下書き:* ${ja}`);

  const NOTHING = T('There is nothing interesting in this room.', 'この部屋には特に気になるものはない。');
  const LOCKED = T('The room is locked.', '部屋には鍵がかかっている。');

  // A body with one of the killer's notes beside it. who: 'man' or 'woman'.
  const sinNote = (who, sin, sinJa) => T(
    `A ${who} lies dead on the floor. A note lies beside ${who === 'man' ? 'him' : 'her'}:\n\n"The Sin of ${sin} has been executed."`,
    `床には${who === 'man' ? '男' : '女性'}の死体が横たわっていて、そばにメモが落ちている。\n\n「${sinJa}の罪人は処刑された。」`);

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
    { id: 'forever',   ...T('To enjoy life here for the rest of their life', 'ここで余生を楽しむこと') },
    { id: 'two',       ...T('To be able to be in two places at once', '同時に二か所にいられるようになること') },
    { id: 'invisible', ...T('To have the ability to turn invisible', '透明になれること') },
    { id: 'young',     ...T('To become young', '若返ること') },
    { id: 'deathday',  ...T('For the day they die never to arrive', '自分が死ぬ日が永遠に来ないこと') },
    { id: 'chess',     ...T('To be the best chess player in the world', '世界一のチェスプレイヤーになること') },
    { id: 'own',       ...T('To own the hotel', 'このホテルのオーナーになること') },
    { id: 'secrets',   ...T('To learn the secrets of the hotel', 'このホテルの秘密を知ること') },
    { id: 'alone',     ...T('To be left alone', '誰にも邪魔されないこと') },
    { id: 'god',       ...T('To get closer to God', '神様に近づくこと') },
    { id: 'wrong',     ...T('To never say something wrong again', '二度と失言しないこと') },
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
        `Caleb checked in hoping to bring his late wife back. He was given Room 14, and like every guest given a room with a 4, he would not live out the day. The hotel granted his wish with the life he was about to lose: the moment he stepped inside, Caleb was gone, and Megan Williams woke up in his place. She has spent every hour since trying to remember how she got here.`,
        `鈴木翔太は亡くした妻を生き返らせたいと願ってチェックインした。割り当てられたのは14号室。4のつく部屋に泊まった客は皆、その日のうちに命を落とす。ホテルは、彼がどのみち失うはずだったその命で願いを叶えた。部屋に足を踏み入れた瞬間、翔太の姿は消え、代わりに妻の結衣が目を覚ましたのだ。彼女はそれ以来ずっと自分がどうやってここに来たのかを思い出そうとしている。`),
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
        `大企業の社長である木村健二は、遠い昔に生き別れた娘に会うため、このホテルを訪れた。午後いっぱい探し回った末、ある女性から「会いたい人には、19時に4号室で会える」と告げられた。その言葉通り、彼は娘と再会した。だが娘は彼を殺すために雇われた暗殺者で、銃を構えて彼を待ち受けていたのだ。互いが誰なのかに気づいたときには、もう手遅れだった。`),
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
        `渡辺哲也は次に出会う女の子を惹きつけたいと願った。その願い通り、その朝まで男性だった和泉千尋が彼に夢中になり、二人は幸せな数時間を過ごした。だが、彼女が少しだけ隣の自室へ戻っている間に、彼は色欲の罪として殺された。`),
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
        `Jones wished to enjoy life at the hotel for the rest of his life, without ever working another day. He walked into Room 2049 to begin his endless holiday, and was shot within the minute: the invisible man had overheard his wish when he checked in. He became the Sin of Sloth. In a way, his wish came true: he spent the rest of his life here.`,
        `長谷川悠人は二度と働かずに、残りの人生をこのホテルで楽しみたいと願った。終わらない休暇を始めようと2049号室に入った直後、彼は撃たれた。チェックインのときにその願いを透明人間に聞かれていたのだ。彼は怠惰の罪として殺された。皮肉にも、彼は願い通り、残りの人生をこのホテルで過ごすことになった。`),
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
        `Lucy wished that the day she dies would never arrive. It never does: she relives the day she checked in, over and over. This is her 15,532th time through, and she knows every body before it falls. Nobody believes her, and she has long since stopped expecting anyone to.`,
        `森田彼方は自分が死ぬ日が永遠に来ないことを願い、その日は本当に来なくなった。彼女はチェックインした日を何度も繰り返しており、今回で15,532回目になる。誰がいつ死ぬのかも全て知っているが、誰も彼女の言葉を信じず、彼女ももうとっくに期待するのをやめた。`),
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
        `竹内勇は誰にも邪魔されないことを願った。エレベーターで8階へ上がり、7777777号室に閉じこもって以来、一度も扉を開けていない。「掃除はいらない。ルームサービスもいらない。ノックもするな。絶対にだ」という、彼の言葉通りに。`),
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
        `坂本葉月は二度と失言したくないと願った。その願い通り、彼女はあれから一度も失言していない。もう何も話せなくなってしまったからだ。`),
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
    // Lorenzo Conti checks in again on the first visit and every second one after.
    {
      match: 'lobby',
      when: s => s.visits() % 2 === 1,
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
          `*The clock shows 8:59.*

*The girl at the check-in counter rests her chin on her hand, looking bored. #1 stands at the counter, filling in a check-in form.*

*A woman steps out of the left elevator. A bird is perched on her shoulder. The bird chirps.*

#2: "I know, I know. We'll find you somewhere you can really fly."

*#2 walks out through the front doors.*

#1: "Who was that?"

Receptionist: "Emily, I think. She checked in this afternoon."`,
          `*時計は20時59分を示している。*

*フロントの若い女性は頬杖をつき、退屈そうにしている。#1はカウンターでチェックイン用紙に記入している。*

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

「見よ、我が最高傑作『七つの体罪』は完成した！ 傲慢の罪人は処刑された。」`);
        if (s.flag('lobbyAfterCorpse')) return body;
        // Until the player has been back to the lobby.
        return T(
          `${body.en}\n\n**You should report this to the receptionist.**`,
          `${body.ja}\n\nフロント係に知らせた方がよさそうだ。`);
      },
      onEnter: s => s.set('diningCorpse'),
      scenes: {
        7: anon(
          `#1: "Hi, I just checked in. You don't look so good, ma'am. Are you okay?"

#2: "NO! I've lost count of how many times I've had this conversation. I've been stuck in this hell for years. Bodies are going to start piling up soon. This afternoon a woman checks in next door and leaves her baby crying all night, and my other neighbor is some chess player who ends up a f**king corpse. GET ME OUT OF HERE!"

#1: "I'll... come back later."`,
          `#1：「どうも、さっきチェックインしたところなんです。お姉さん、顔色が悪いようですけど、大丈夫ですか？」

#2：「大丈夫なわけないでしょ！ この会話、もう何回したか分かんないのよ！ 何年も……何年も、この地獄から抜け出せないの！ もうすぐ死体がどんどん増えていくわ。今日の午後には隣の部屋に女がチェックインして、一晩中赤ん坊を泣かせっぱなし！ もう片方の隣はどこかのチェスプレイヤーで、そいつもどうせ死体になる！ ……クソッ！ ここから出して！」

#1：「また……後で来ます」`),
        8: anon(
          `#1: "This is the best food I've had in my life!"

#2: "Yeah, the food here is awesome. By the way, nice to meet you. I'm Taylor. What's your name?"

#1: "Nice to meet you too. I'm Dominique, a famous food reviewer. If you ever want to talk about food, come find me in Room 40. I'm heading back there now."

*#1 leaves. A moment later, #3 walks in.*

#3: "Morning! Just checked in a bit after 8. Mind if I sit here?"

#2: "…"

#3: "Are you okay? You've gone quiet."

#2: "Sorry! Yes, please, sit. I don't know what's come over me. Until this morning, I'd never have looked twice at a man."

#3: "Is that so? Then today must be my lucky day."`,
          `#1：「こんなうまい料理、生まれて初めて食べたわ！」

#2：「本当、ここの料理は最高ですよね。あ、はじめまして。和泉千尋と言います。あなたは？」

#1：「おう、はじめまして！ 俺は田中博。これでも料理評論家として、ちょっとは名が知れてるんやで。料理の話がしたなったら、いつでも40号室に来てな。ほな、いったん部屋に戻るわ」

*#1が出ていく。少しして、#3が入ってくる。*

#3：「おはよ〜！ 8時過ぎにチェックインしたばっかなんだけど、ここ座っていい？」

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

「暴食の罪人は処刑された。」

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

#1：「失礼。あなたが色々なことが*分かる*という方ですね。今日の午後、若い女性から聞きました」

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
"I don't know… I think I've lost all my memories. All I remember is that I'm staying in Room 2."

He is idly moving pieces on the chessboard beside him.

"Strange… I don't know why, but my hands seem to know where they go."`,
        `ソファに男が座っている。自己紹介をして名前を尋ねると、彼はこう答えた。
「分からない……。記憶を全部なくしてしまったみたいなんだ。覚えているのは、2号室に泊まっていることだけだ」

彼は傍らのチェス盤で、何気なく駒を動かしている。

「不思議だな……。なぜか分からないけど、駒をどこに置けばいいか、手が覚えているみたいなんだ」`),
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

#4: "I tried to warn you."

#2: "I haven't seen you around before. Are you new here?"

#4: "I only checked in an hour ago."

#3: "This set is cursed. I'm asking the front desk for a new one."

#2: "Good luck. He couldn't even tell me where the restrooms were."`,
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

#4：「だから言ったのに」

#2：「見ない顔だな。ここには来たばかりか？」

#4：「一時間前にチェックインしたばかりなんだ」

#3：「この牌、絶対呪われてる。フロントで替えてもらってくる」

#2：「やめときなって。彼はトイレの場所も知らなかったんだから」`),
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
          `*#2 sits alone in the back row, staring past the screen.*

#1: "Mind if I sit? I can't sit still today. Have you heard about the bodies?"

#2: "The bodies?"

#1: "I saw a corpse in the dining room at lunch. Then some coward shot the love of my life while I was out of the room. For one minute! One minute! I'm going to find whoever did it, and I'm going to make them pay."

#2: "I'm sorry to hear that. I'm afraid I don't know anything that could help. The killer might still be on the loose, so stay safe."

#1: "Safe? I'm not the one who should be scared. If you hear anything about the killer, anything at all, tell me. I'm in Room 848."

#2: "If you need me and I'm not in the common spaces, find me in Room 486."`,
          `*#2が最後列に一人で座り、画面の向こうをぼんやりと見つめている。*

#1：「座ってもいいですか？ 今日はじっとしていられなくて。死体の話、聞きました？」

#2：「死体？」

#1：「お昼にダイニングルームで死体を見たんです。そのあと、私がほんの一分部屋を離れた隙に、どこかの卑怯者が私の最愛の人を撃ち殺した。たった一分ですよ！ 犯人は必ず見つけ出して、報いを受けさせてやる」

#2：「それはお気の毒に。残念ながら、お役に立てそうなことは何も知りません。犯人はまだうろついているかもしれないから、気をつけて」

#1：「気をつける？ 気をつけなきゃいけないのは、犯人の方です。犯人について何か聞いたら、どんなことでもいいから教えてください。私は848号室です」

#2：「何かあれば、共用スペースにいないときは486号室を訪ねてください」`),
        17: anon(
          `*A film plays to a nearly empty room. #2 is still in the back row, where he has been for the last hour, not watching the screen. #1 sits a few seats away.*

#1: "You haven't looked at the movie once. Is everything okay?"

#2: "Forgive me. I came here to find someone I haven't seen in a very long time, but I still have no idea where they are."

#1: "Then maybe talk to the woman in the common room. She seems to know things before they happen."

#2: "Before they happen?"

#1: "An hour ago she told me 'Alice will go to Wonderland.' Before that, 'Envy will die in Room 8964.' She looked like she believed every word."

#2: "Do you believe her?"

#1: "In this hotel? I'm not ruling anything out. If she can tell you where to find someone, maybe she can tell me where to find the killer."

#2: "If she really sees what's coming… maybe she can tell me where to find who I'm looking for. Thank you, young lady."`,
          `*ほとんど人のいない部屋で映画が流れている。#2は一時間前と同じ最後列の席に座ったままで、相変わらず画面を見ていない。#1は数席離れたところに座っている。*

#1：「さっきから一度も映画を見ていませんね。大丈夫ですか？」

#2：「失礼。ずいぶん長い間会っていない人を探しに来たんですが、いまだにどこにいるのか見当もつかなくて」

#1：「それなら、談話室にいる女の人と話してみたら？ これから起きることが分かるみたいなの」

#2：「これから起きること？」

#1：「一時間前は『アリスはワンダーランドへ行く』って言ってた。その前は『嫉妬は8964号室で死ぬ』。本気で信じているみたいだった」

#2：「あなたは信じますか？」

#1：「このホテルで？ 何があってもおかしくないと思う。人の居場所が分かるなら、犯人の居場所だって分かるかもしれない」

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

#1: "Wait, I just saw this on my phone. The news says you became the richest person in the world today. Some deal went through overnight."

#2: "Did it? How nice."

#1: "But… why would someone like you come to a place like this? You already have everything."

#2: "Everything? There is no such thing. That is the difference between us. You are not hungry enough. That is why you are a commoner. And what brings someone like you here?"

#1: "I came here to bring back someone precious I lost..."

#2: "Well, good luck with that. I'll take my leave now."`,
          `#1：「すみません……あなた、よく雑誌の表紙に載っている方ですよね？ あの有名なジュエリーブランドのオーナーの」

#2：「ええ、そうですわ」

#1：「待って、今スマホで見たんですけど。ニュースによると、今日あなたが世界一の金持ちになったって。一晩で大きな取引がまとまったらしい」

#2：「あら、そうですの。それはよかったですわ」

#1：「でも……どうしてあなたのような人がこんなところに？ もう何もかも持っているじゃないですか」

#2：「何もかも？ そんなもの、ありませんわ。それがあなたとの違いですの。あなたは飢えが足りないのよ。だから庶民なのですわ。それで、あなたみたいな庶民が、こんなところに何の用ですの？」

#1：「僕は……失った大切な人を取り戻すために来たんです」

#2：「そう。せいぜい頑張ってくださいな。では、ごきげんよう」`),
        15: anon(
          `#1: "Excuse me. Someone I care about was shot an hour ago, and I'm going to find out who did it. Have you seen anything strange today?"

#2: "I'm sorry. I checked in just before 3 o'clock. But… something strange did happen when I walked into my room. I suddenly knew something. Something that hasn't happened yet."

#1: "What do you mean?"

#2: "Envy will die in Room 8964."

#1: "Envy? The note next to his body said 'Lust'. Lust! As if that's who he was. As if that's a reason to kill someone!"

#2: "I don't know what it means either. Oh, and if you want strange: I saw my neighbor talking to a bird. She's probably crazy."

#1: "I'll take anything I can get. If you learn anything else, come find me. I'm in Room 848."

#2: "Room 24. Knock if you need me."`,
          `#1：「すみません。一時間前、大切な人が撃たれたんです。犯人は絶対に見つけ出してみせます。今日、何か変わったことを見ませんでしたか？」

#2：「お気の毒に。15時ちょっと前にチェックインしたばかりなの。でも……部屋に入ったとき、不思議なことがあったの。急に、まだ起きていないことが分かったの」

#1：「どういうことですか？」

#2：「嫉妬は8964号室で死ぬ」

#1：「嫉妬？ 彼の遺体のそばにあったメモには『色欲』って……。色欲ですって？ まるで彼がそういう人間だったみたいに！ そんなことで人を殺していいっていうの！？」

#2：「私にも意味は分からないわ。ああ、変わったことといえば、隣の部屋の人が鳥と話しているのを見たわ。たぶん頭がおかしいのね」

#1：「どんなことでも助かります。他に何か分かったら、教えてください。私は848号室にいます」

#2：「私は24号室よ。用があればノックして」`),
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

#1: "Another one of the seven deadly sins. Another body, and that coward is still out there somewhere, laughing at all of us."

#2: "Please be careful."

#1: "Careful? I'm done being careful. I know what I have to do."

*#1 leaves, fists clenched.*`,
          `#1：「ここにいたんですね。8964号室に行ってきました。あなたの言った通りでした。嫉妬は死んでいました」

#2：「知ってる。もう、外れてほしいとは思わなくなったわ。ちょうど次のが来たところよ。『憤怒は8484号室で死ぬ』」

#1：「また七つの大罪……。また死体が増えたのに、あの卑怯者はまだどこかで私たちを嘲笑ってる」

#2：「どうか気をつけて」

#1：「気をつける？ もうそんな段階じゃありません。自分が何をすべきか、分かっています」

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
      text: T(`You open the door and find a suitcase with the name tag "Mark Zhang".

Small feathers are scattered across the bed, and a few more drift along the floor.`, `ドアを開けると、「青木大輔」というネームタグのついたスーツケースが置いてあった。

ベッドの上には小さな羽が散らばっていて、床にも何枚か舞い落ちている。`),
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
    // Empty: Lorenzo dies the moment he enters and is back at the check-in desk,
    // so there is never a body to find.
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
          `*#1 arrives at the door, suitcase in hand.*

#1: "All checked in! Now I can stay here for the rest of my life and never work again!"

*#1 enters the room.*

*A gunshot rings out.*

*#1 collapses to the floor.*

*A note falls beside the body.*`,
          `*#1がスーツケースを手に、部屋の前にやってくる。*

#1：「よし、チェックイン完了！ これで一生ここにいられる。もう二度と働かなくていいんだ！」

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
      // Ruby checks in at 20:00 and writes until after Lorenzo's deaths in Room 444 begin.
      scenes: {
        20: anon(
          `*#1 enters the room, closes the door behind her, and freezes.*

#1: "Oh… Oh, I see. So that's how this place works."

*#1 sits down at the desk and starts writing quickly.*`,
          `*#1が部屋に入り、扉を閉めたところで立ち尽くす。*

#1：「ああ……そういうこと。このホテルはそういう仕組みなのね。」

*#1は机に向かい、急いで何かを書き始める。*`),
        23: anon(
          `*#1 is back at the desk, writing.*

*#1 puts down her pen and reads the page over once.*

#1: "Whoever finds this, I hope it helps."

*#1 leaves the page on the desk and walks out of the room.*`,
          `*#1はまた机に向かって書き続けている。*

*#1はペンを置き、書き上げた紙を一度読み返す。*

#1：「これを見つけた誰かの役に立ちますように。」

*#1は紙を机に残し、部屋を出ていく。*`),
      },
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
            `彼女は白石美月と名乗り、このホテルは危ないかもしれないと忠告してくれた。昨日の18時頃、隣の部屋から銃声が聞こえたらしい。`),
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
    // Memory Device once the player reports the body in the dining room, and a
    // last lead at 15 confirmed guests.
    receptionist: {
      speaker: T('Receptionist', 'フロント係'),
      start: 'menu',
      nodes: {
        menu: {
          choices: [
            { text: T('Can you tell me about this hotel?', 'このホテルについて教えてもらえますか？'), next: 'hotel' },
            { text: T('Who is your boss?', 'あなたの上司は誰ですか？'), next: 'boss' },
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
            // Shown whether or not the choices above have been picked.
            {
              text: T('I have identified 15 guests.', 'お客様を15人特定しました。'),
              next: 'fifteen',
              when: s => s.confirmedCount() >= 15 && !s.flag('told15'),
              inOrder: false,
            },
            // Takes its place afterwards, so the lead to Room 3333360 can be heard again.
            {
              text: T('Which room did your boss mention?', '上司がおっしゃっていたのは何号室でしたっけ？'),
              next: 'lead15',
              when: s => s.flag('told15'),
              inOrder: false,
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
            `Not another one… My boss says you're doing some detective work here. Take this Memory Device: it lets you replay scenes from yesterday, though it won't necessarily show you everything that happened. Come back once you've correctly identified 15 guests.

The boss suggests going to Rooms 4, 5 and 14.`,
            `またですか……。昨日も人が死んだと聞きました。あなたが探偵のようなことをなさっていると、上司から伺っております。こちらの記憶装置をお使いください。昨日の出来事を再生できます。ただ、全部が映るとは限らないんです。お客様を15人正しく特定できたら、またいらしてください。

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
        fifteen: {
          text: T(
            `Nice work! The boss told me that someone might have left something interesting behind at Room 3333360. Good luck with the rest of the investigation.`,
            `お見事です！ 上司の話では、3333360号室に誰かが何か面白いものを残していったかもしれないとのことです。残りの調査も頑張ってください。`),
          do: s => {
            s.set('told15');
            s.note(T('Receptionist: someone might have left something interesting in Room 3333360.', 'フロント係：3333360号室に誰かが何か面白いものを残していったかもしれない。'), 'lead-3333360');
          },
          next: 'menu',
        },
        lead15: {
          text: T(
            `The boss told me that someone might have left something interesting behind at Room 3333360.`,
            `上司の話では、3333360号室に誰かが何か面白いものを残していったかもしれないとのことです。`),
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
  // `s.markGuest` strikes out confirmed guests and tags the register rows a
  // name is written on (the scenes viewer passes no `s`).
  const guestList = (lang, s) => characters.filter(c => !c.player)
    .map(c => ({
      id: c.id,
      name: c.name[lang],
      reading: lang === 'ja' && c.kana && hasKanji(c.name.ja) ? c.kana : '',
      key: lang === 'ja' && c.kana ? c.kana : c.name[lang],
      gender: GENDER[c.gender] ? GENDER[c.gender][lang] : '',
    }))
    .sort((a, b) => a.key.localeCompare(b.key, lang))
    .map(g => [g.id, lang === 'ja'
      ? `${g.name}${g.reading ? `（${g.reading}）` : ''}${g.gender ? `（${g.gender}）` : ''}`
      : `${g.name}${g.gender ? ` (${g.gender})` : ''}`])
    .map(([id, line]) => `• ${s && s.markGuest ? s.markGuest(id, line) : line}`)
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
      `The story, scenario and mystery of this game are the author's original work. AI assistance was used only to build the interface and to help with editing and translation, and the author reviewed and revised everything it produced.

Many thanks to everyone who playtested the game!`,
      `本作のストーリー、シナリオ、謎解きは、全て作者によるオリジナルです。AIはUIの制作と文章の推敲・翻訳の補助にのみ使用しており、生成された内容は全て作者が確認・修正しています。
テストプレイしてくださった皆さん、本当にありがとうございました！`),
    confirmBatch: 3,

    // The elimination grid groups the guests by their hours on the Check-in
    // List, and lets the player tag each wish with one of those hours. Each
    // guest's name carries their gender as the Guest List gives it.
    grid: {
      when: s => s.hasPaper('checkin'),
      hours: c => c.checkIn,
      label: h => T(hourLabel.en(h), hourLabel.ja(h)),
      tag: c => GENDER[c.gender] || '',
    },

    // Once 15 guests are confirmed, remind the player that the receptionist
    // asked them to come back (her lead to Room 3333360), until they have.
    onConfirm: s => {
      if (s.confirmedCount() < 15 || s.flag('told15') || s.flag('remind15')) return;
      s.set('remind15');
      const reminder = T(
        `You have identified 15 guests. Go back to the lobby and tell the receptionist.`,
        `宿泊客を15人特定した。ロビーに戻って、フロント係に伝えよう。`);
      s.toast(reminder);
      s.note(reminder, 'remind-15');
    },
    debug: false,             // true shows the debug buttons (for testing); false for release

    // Extra buttons in the top bar while debugging.
    debugActions: [
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
        // Points the player at the papers held from the start, which are
        // otherwise easy to miss in the Inventory.
        text: T(
          `Beneath it are the other sheets: a *Guest List*, a *List of Wishes* and a *Check-in List*. You can look through them, and the Instructions, any time in your **Inventory**.`,
          `その下には、ほかの紙が重なっていた。「宿泊客名簿」「願いの一覧」「チェックイン一覧」だ。これらの紙と指示書は、いつでも **持ち物** から見返すことができる。`),
      },
      {
        // The player's key card. No number on it, so it doesn't give away Room 78.
        give: 'card',
        text: T(
          `Under the papers lies a key card stamped with the hotel's crest. You turn it over. There's no room number on it.`,
          `紙の下には、ホテルの紋章が入ったカードキーがあった。裏返してみたが、部屋番号はどこにも書かれていない。`),
      },
      {
        // The room next door on the elevator side (lower numbers) is Aida's 76,
        // which hints that the player's is 78 (77 is not on Floor 1).
        text: T(
          `You step out of your room into the corridor and almost bump into a woman coming out of the room next to yours, on the elevator side.`,
          `部屋を出て廊下に足を踏み出したとたん、エレベーター側の隣の部屋から出てきた女性とぶつかりそうになった。`),
      },
    ],

    // The Hints tab: the player types a guest's name or picks a wish. Asking
    // by name shows the hints with that `guest`, asking by wish the hints with
    // that `wish` (hints with neither are always listed, under "General"). It
    // lists the question of every hint whose `needs` the player has met, in
    // this order; the text shows once they ask for it. Once the guest is
    // confirmed (for a wish, whoever made it), their hints stay listed, and
    // 'hint:id' needs on that guest's hints count as met:
    //   { id, guest: charId | wish: wishId, needs: ['hint:id' (that hint shown first), 'dining@8'
    //     (a room seen at 8 o'clock yesterday), 'lobby' (seen in the present),
    //     'paper:id', 'flag:key', 'skill:id', 'confirmed:charId',
    //     '!flag:key' (not yet)], question: T(en, ja), text: T(en, ja) }
    // scenes.html's Hints view writes everything between the two markers, so
    // edit the list either there or here, not in both at once.
    // @hints-begin
    hints: [
      {
        id: 'hg1st0',
        question: T(`I have no idea what to do. Where do I start?`, `何をすればいいのか全く分からない。どこから始めればいい？`),
        text: T(`Read the Instructions in your Inventory first. Then start with the woman you bumped into, in Room 76, the room next to yours: everything you need for her is in that room. After that, walk to the rooms mentioned in conversations and talk to everyone you meet.`, `まずは持ち物にある指示書を読もう。それから、ぶつかりそうになった女性がいる76号室、つまり自分の部屋の隣から始めよう。彼女について必要な情報は、全てその部屋にある。その後は、会話に出てきた部屋を訪ね、出会った人と片っ端から話してみよう。`),
      },
      {
        id: 'hg2mov', needs: ['!lobby'],
        question: T(`How do I get anywhere other than Floor 1?`, `1階以外の場所にはどうやって行く？`),
        text: T(`Walk to Room 1, next to the elevators, and use the elevator there. It takes you down to the Lobby, where you can reach the other rooms on Floor 0.`, `エレベーターの隣にある1号室まで歩いて、そこのエレベーターに乗ろう。ロビーまで降りれば、0階の他の部屋にも行けるようになる。`),
      },
      {
        id: 'hg3reg',
        question: T(`I'm sure some of my rows are right. Why aren't they confirmed?`, `正しいはずの行があるのに、なぜ確定しない？`),
        text: T(`The Register only confirms rows three at a time: nothing happens until three rows are fully correct. A row counts only when the name, the wish and the room number are all right. If you have one or two rows you're sure of, keep going: they will be confirmed together with the next ones.`, `宿帳は三行ずつしか確定しない。完全に正しい行が三つそろうまで、何も起こらない。名前、願い、部屋番号の全てが正しくて初めて正しい行と数えられる。確信のある行が一つか二つしかないなら、そのまま先へ進もう。次に正しい行がそろったとき、まとめて確定される。`),
      },
      {
        id: 'hg4mem', needs: ['!skill:memory'],
        question: T(`How do I see what happened yesterday?`, `昨日何があったのかを見るにはどうすればいい？`),
        text: T(`You need the Memory Device. Something terrible has happened on Floor 0. Have you seen every room there?`, `記憶装置が必要だ。0階で何か恐ろしいことが起きている。0階の部屋は全て見ただろうか？`),
      },
      {
        id: 'hg5mem', needs: ['hint:hg4mem', 'dining', '!skill:memory'],
        question: T(`I found the body in the Dining Room. What now?`, `ダイニングルームで遺体を見つけた。次はどうする？`),
        text: T(`Report it to the receptionist in the Lobby.`, `ロビーのフロント係に報告しよう。`),
      },
      {
        id: 'hg6use', needs: ['skill:memory'],
        question: T(`How do I use the Memory Device?`, `記憶装置はどうやって使う？`),
        text: T(`In any room, pick an hour from the row of buttons to see what happened there at that hour yesterday. Grayed-out hours have nothing to see. The hour stays set as you walk, so you can follow one moment from room to room. "Back to the present" returns to today.`, `どの部屋でも、時刻のボタンを選ぶと、昨日のその時間にそこで何があったかが見られる。灰色の時刻には何もない。選んだ時刻は移動しても変わらないので、ある時間に起きたことを部屋から部屋へ追いかけられる。「現在に戻る」を押せば今日に戻る。`),
      },
      {
        id: 'hg6lea', needs: ['skill:memory'],
        question: T(`I have the Memory Device. Where should I look first?`, `記憶装置を手に入れた。まずどこを調べればいい？`),
        text: T(`Ask the receptionist in the Lobby where to start looking.`, `ロビーのフロント係に、どこから調べればいいか聞いてみよう。`),
      },
      {
        id: 'hg7roo',
        question: T(`There are infinitely many rooms. Which ones are worth visiting?`, `部屋は無限にある。どの部屋を訪ねればいい？`),
        text: T(`Any room number that comes up in a conversation, a scene, a note or a paper. The rooms on either side of a guest's room are worth a look too: neighbors hear things.`, `会話や場面、メモ、書類に出てきた部屋番号は全て訪ねる価値がある。宿泊客の部屋の両隣も見ておこう。隣人はいろいろなことを耳にしているものだ。`),
      },
      {
        id: 'hg8chk', needs: ['skill:memory'],
        question: T(`The people in the scenes have no names. How do I tell who they are?`, `場面に出てくる人には名前がない。誰なのかをどうやって見分ける？`),
        text: T(`Look at the hour of the scene. In the Lobby, people are checking in, and the Check-in List tells you who checked in during each hour, so whoever you see there must be one of those names. Elsewhere, the Guest List shows each guest's gender, and many people mention their room or their neighbors.`, `場面の時刻に注目しよう。ロビーでは人がチェックインしており、チェックイン一覧には各時間帯にチェックインした人が載っている。つまり、そこで見かけた人は、その時間帯の名前のどれかだ。それ以外の場所では、宿泊客名簿に載っている性別や、本人が口にする部屋番号や隣人の話が手がかりになる。`),
      },
      {
        id: 'hg9grd', needs: ['hint:hg8chk'],
        question: T(`How do I keep track of who could have made which wish?`, `誰がどの願いをした可能性があるのか、どうやって整理すればいい？`),
        text: T(`Open the Elimination grid at the top of the Register. Give each wish the hour (or range of hours) you think it was made in the Lobby, and everyone who didn't check in at that hour is crossed out of its row.`, `宿帳の上にある「消去法の表」を開こう。ロビーでその願いが告げられたと思う時刻（または時刻の範囲）を各願いにつけると、その時刻にチェックインしていない人は、その行で自動的に✗になる。`),
      },
      {
        id: 'hgaflr',
        question: T(`I can't walk to some rooms, like Room 7. How do I get there?`, `7号室など、歩いて行けない部屋がある。どうやって行けばいい？`),
        text: T(`Those rooms aren't on Floor 1, and the elevator only takes a guest up to the floor of their own room. You don't need to go there: what you need to know about those rooms can be learned elsewhere.`, `それらの部屋は1階にはない。エレベーターは、宿泊客を自分の部屋のある階にしか連れて行かない。そこへ行く必要はない。その部屋について知るべきことは、別の場所で分かる。`),
      },
      {
        id: 'hgbsec', needs: ['!paper:secrets'],
        question: T(`I've followed every lead I have. What's next?`, `手がかりは全て追いかけた。次は何をすればいい？`),
        text: T(`Once you have confirmed 15 guests, tell the receptionist in the Lobby. Their boss left a lead for you.`, `宿泊客を15人確定させたら、ロビーのフロント係に伝えよう。上司からの手がかりを教えてくれる。`),
      },
      {
        id: 'hgcdie', needs: ['paper:secrets'],
        question: T(`What does "Your room number decides whether you live to see the end of the day" mean? (Part 1)`, `「部屋番号によって、その日の終わりまで生きられるかが決まる」とはどういう意味？ #1`),
        text: T(`Write down the room numbers of everyone you know died yesterday or today. What do they have in common?`, `昨日か今日に亡くなったと分かっている人の部屋番号を書き出してみよう。何か共通点はないだろうか？`),
      },
      {
        id: 'hgddie', needs: ['hint:hgcdie'],
        question: T(`What does "Your room number decides whether you live to see the end of the day" mean? (Part 2)`, `「部屋番号によって、その日の終わりまで生きられるかが決まる」とはどういう意味？ #2`),
        text: T(`Every guest whose room number contains the digit 4 dies on the day they check in. If you know someone died but not where, the rooms with a 4 near where they were last seen are good places to look.`, `部屋番号に4が含まれる宿泊客は、チェックインしたその日に死ぬ。誰かが死んだと分かっていて場所が分からないなら、最後に目撃された場所の近くにある、4を含む部屋を探してみよう。`),
      },
      {
        id: 'hgeend', needs: ['paper:secrets'],
        question: T(`I've placed most guests, but I'm stuck on the last few.`, `ほとんどの宿泊客は分かったが、最後の数人で行き詰まっている。`),
        text: T(`Some guests are meant to be found by elimination. Open "Not written yet" at the top of the Register, or the Elimination grid, to see which names and wishes are left, and match them up using the check-in times.`, `何人かの宿泊客は、消去法で見つけるようにできている。宿帳の上にある「未記入」や「消去法の表」を開いて、残っている名前と願いを確かめ、チェックイン時刻を使って組み合わせよう。`),
      },
      {
        id: 'hzz7x0', guest: 'aida',
        question: T(`How do I figure out her wish and room number?`, `中藤理亜の願いと部屋番号はどうやって分かる？`),
        text: T(`Everything you need is in the dialogue in Room 76.`, `必要な情報は、76号室での会話に全て揃っている。`),
      },
      {
        id: 'h0sjvb', wish: 'help',
        question: T(`How do I figure out the owner of this wish?`, `この願いの持ち主はどうやって分かる？`),
        text: T(`Do you remember talking to someone who said they wished to help?`, `「誰かの役に立ちたい」と願ったと話していた人を、覚えていないだろうか？`),
      },
      {
        id: 'h3v2ly', guest: 'kelly',
        question: T(`How do I figure out her room number?`, `坂本葉月の部屋番号はどうやって分かる？`),
        text: T(`Reread the dialogue in the Common Room.`, `談話室での会話を読み返してみよう。`),
      },
      {
        id: 'hqwzqi', guest: 'kelly', needs: ['hint:h3v2ly'],
        question: T(`How do I figure out her wish? (Part 1)`, `坂本葉月の願いはどうやって分かる？ #1`),
        text: T(`Could it possibly be related to why she can't speak?`, `彼女が話せないことと、何か関係があるのでは？`),
      },
      {
        id: 'h9szqe', guest: 'kelly', needs: ['hint:hqwzqi'],
        question: T(`How do I figure out her wish? (Part 2)`, `坂本葉月の願いはどうやって分かる？ #2`),
        text: T(`She was not mute before coming to the hotel. What could have made her lose her voice?`, `彼女は、ホテルに来る前は普通に話せていた。何が彼女から声を奪ったのだろう？`),
      },
      {
        id: 'h4ygvx', wish: 'wrong', needs: ['common'],
        question: T(`Who made this wish? (Part 1)`, `この願いの持ち主は誰？ #1`),
        text: T(`Has anyone you talked to appeared to be in a state that could be related to this wish?`, `話をした人の中に、この願いと関係がありそうな人はいなかっただろうか？`),
      },
      {
        id: 'hsm5gs', wish: 'wrong', needs: ['hint:h4ygvx'],
        question: T(`Who made this wish? (Part 2)`, `この願いの持ち主は誰？ #2`),
        text: T(`What is a way for this wish to be granted?`, `この願いは、どうすれば叶えられるだろう？`),
      },
      {
        id: 'hwli1c', guest: 'sophia', needs: ['4'],
        question: T(`How do I figure out her wish? (Part 1)`, `木村エマの願いはどうやって分かる？ #1`),
        text: T(`Is there anyone else on the Guest List who might be related to her?`, `宿泊客名簿の中に、彼女と関係がありそうな人はいないだろうか？`),
      },
      {
        id: 'hiqrm6', guest: 'sophia', needs: ['hint:hwli1c', 'skill:memory'],
        question: T(`How do I figure out her wish? (Part 2)`, `木村エマの願いはどうやって分かる？ #2`),
        text: T(`For every room you go to, make sure you read all the scenes in the past as well.`, `部屋を訪れたら、過去の場面も必ず全て確認しよう。`),
      },
      {
        id: 'hpgtl2', guest: 'sophia', needs: ['hint:hiqrm6'],
        question: T(`How do I figure out her wish? (Part 3)`, `木村エマの願いはどうやって分かる？ #3`),
        text: T(`There is someone on the Guest List with the same surname. Who could it be?`, `宿泊客名簿に、同じ名字の人物がいる。誰だろう？`),
      },
      {
        id: 'hjbj9p', guest: 'sophia', needs: ['hint:hpgtl2', '4@19'],
        question: T(`How do I figure out her wish? (Part 4)`, `木村エマの願いはどうやって分かる？ #4`),
        text: T(`Did someone say something in one of the scenes you have visited that shows the relationship between her and another guest?`, `これまでに見た場面で、彼女と他の宿泊客との関係が分かる台詞はなかっただろうか？`),
      },
      {
        id: 'h5a18i', guest: 'sophia', needs: ['hint:hjbj9p'],
        question: T(`What scenes should I look at?`, `どの場面を見ればいい？`),
        text: T(`Revisit all the Room 4 scenes.`, `4号室の場面を全て見直そう。`),
      },
      {
        id: 'h6jztu', guest: 'sophia', needs: ['hint:h5a18i'],
        question: T(`How do I figure out her room number?`, `木村エマの部屋番号はどうやって分かる？`),
        text: T(`It is where she died.`, `彼女が亡くなった場所だ。`),
      },
      {
        id: 'h0e1j9', wish: 'target', needs: ['4@19', '4'],
        question: T(`How do I figure out the owner of this wish? (Part 1)`, `この願いの持ち主はどうやって分かる？ #1`),
        text: T(`There was a note that mentioned a "target". Maybe it is related?`, `「ターゲット」について書かれたメモがあった。何か関係があるかもしれない。`),
      },
      {
        id: 'hhbc3r', wish: 'target',
        question: T(`Where should I look?`, `どこを調べればいい？`),
        text: T(`You should check out Room 4.`, `4号室を調べてみよう。`),
      },
      {
        id: 'h4dqo2', wish: 'target', needs: ['hint:h0e1j9', 'hint:hhbc3r'],
        question: T(`How do I figure out the owner of this wish? (Part 2)`, `この願いの持ち主はどうやって分かる？ #2`),
        text: T(`It is related to the 7pm scene in Room 4.`, `4号室の19時の場面に関係がある。`),
      },
      {
        id: 'hiiv4z', wish: 'target', needs: ['hint:h4dqo2'],
        question: T(`How do I figure out the owner of this wish? (Part 3)`, `この願いの持ち主はどうやって分かる？ #3`),
        text: T(`Someone shot their dad in that scene. He turns out to be on the Guest List too.`, `その場面で、ある人物が自分の父親を撃ってしまう。その父親も、宿泊客名簿に載っている。`),
      },
      {
        id: 'h032n8', wish: 'target', needs: ['hint:hiiv4z'],
        question: T(`How do I figure out the owner of this wish? (Part 4)`, `この願いの持ち主はどうやって分かる？ #4`),
        text: T(`Check the list of names again and see if you can find a father-child pair.`, `名簿をもう一度見て、親子らしい二人がいないか探してみよう。`),
      },
      {
        id: 'hibqdl', guest: 'dominique', needs: ['dining@8'],
        question: T(`How do I figure out his wish? (Part 1)`, `田中博の願いはどうやって分かる？ #1`),
        text: T(`Have you seen someone named Dominique in one of the scenes?`, `どこかの場面で「田中博」と名乗る人物を見かけなかっただろうか？`),
      },
      {
        id: 'hwialo', guest: 'dominique', needs: ['skill:memory'],
        question: T(`Where should I look?`, `どこを調べればいい？`),
        text: T(`Check the Dining Room scene at 8am.`, `8時のダイニングルームの場面を見てみよう。`),
      },
      {
        id: 'hge9cp', guest: 'dominique', needs: ['hint:hibqdl'],
        question: T(`How do I figure out his wish? (Part 2)`, `田中博の願いはどうやって分かる？ #2`),
        text: T(`The Dining Room scene at 8am has all the information you need (including the room number).`, `8時のダイニングルームの場面に、部屋番号も含めて必要な情報が全て揃っている。`),
      },
      {
        id: 'hw4hfj', wish: 'food', needs: ['skill:memory'],
        question: T(`Where should I look? (Part 1)`, `どこを調べればいい？ #1`),
        text: T(`Is there a scene where someone talks about good food?`, `おいしい料理について話している場面はなかっただろうか？`),
      },
      {
        id: 'hru6ej', wish: 'food', needs: ['hint:hw4hfj'],
        question: T(`Where should I look? (Part 2)`, `どこを調べればいい？ #2`),
        text: T(`Check the Dining Room at 8am.`, `8時のダイニングルームを見てみよう。`),
      },
      {
        id: 'hxwt72', wish: 'food', needs: ['hint:hru6ej'],
        question: T(`How do I figure out the owner of this wish?`, `この願いの持ち主はどうやって分かる？`),
        text: T(`All the information you need is in the scene.`, `必要な情報は、全てその場面にある。`),
      },
      {
        id: 'himdc5', guest: 'alice', needs: ['paper:secrets'],
        question: T(`How do I figure out her wish? (Part 1)`, `アリス・ミラーの願いはどうやって分かる？ #1`),
        text: T(`Alice is mentioned in some scenes. Make sure you have checked those scenes first.`, `アリスの名前は、いくつかの場面に出てくる。まずはそれらの場面を確認しよう。`),
      },
      {
        id: 'hnb6hi', guest: 'alice', needs: ['hint:himdc5'],
        question: T(`How do I figure out her wish? (Part 2)`, `アリス・ミラーの願いはどうやって分かる？ #2`),
        text: T(`Someone had a revelation that "Alice will go to Wonderland." Have you seen anything that explains how Alice could go to Wonderland?`, `「アリスはワンダーランドへ行く」という預言があった。アリスがどうやってワンダーランドへ行くのか、手がかりは見つかっただろうか？`),
      },
      {
        id: 'hfp8s1', guest: 'alice', needs: ['hint:hnb6hi'],
        question: T(`Where should I look?`, `どこを調べればいい？`),
        text: T(`Check the paper titled "Secrets of the Hotel".`, `「ホテルの秘密」という紙を確認しよう。`),
      },
      {
        id: 'hi9va2', guest: 'alice', needs: ['hint:hfp8s1'],
        question: T(`What exactly am I looking for?`, `具体的に何を探せばいい？`),
        text: T(`One of the lines in the paper explains what happened to Alice.`, `その紙の中に、アリスに何が起きたのかを示す一文がある。`),
      },
      {
        id: 'hz0smt', guest: 'alice', needs: ['hint:hi9va2'],
        question: T(`But how do I figure out her wish?`, `でも、肝心の願いはどうやって分かる？`),
        text: T(`Look for a wish that can be satisfied by transporting the wish owner to another world.`, `本人を別の世界へ連れていけば叶う願いを探そう。`),
      },
      {
        id: 'h9sune', wish: 'peace',
        question: T(`How should I start?`, `何から始めればいい？`),
        text: T(`Think about different ways this wish could be satisfied.`, `この願いが叶う方法を、色々考えてみよう。`),
      },
      {
        id: 'h7vbe2', wish: 'peace', needs: ['paper:secrets'],
        question: T(`I still don't understand this wish.`, `この願いの意味が、まだよく分からない。`),
        text: T(`Try interpreting the wish literally. Does it relate to the fate of someone you might have heard about?`, `願いを文字通りに受け取ってみよう。どこかで聞いた誰かの運命と、関係していないだろうか？`),
      },
      {
        id: 'hqcwee', wish: 'deathday',
        question: T(`How should I start?`, `何から始めればいい？`),
        text: T(`Think about different ways this wish could be satisfied.`, `この願いが叶う方法を、色々考えてみよう。`),
      },
      {
        id: 'h8nhal', wish: 'deathday', needs: ['dining@7', 'hint:hqcwee'],
        question: T(`I still don't understand this wish.`, `この願いの意味が、まだよく分からない。`),
        text: T(`Try interpreting the wish literally. The owner of this wish cannot reach the day they die.`, `願いを文字通りに受け取ってみよう。この願いの持ち主は、自分が死ぬ日に辿り着けない。`),
      },
      {
        id: 'hp2ew5', wish: 'deathday', needs: ['hint:h8nhal'],
        question: T(`Can you give me a more direct hint?`, `もっと直接的なヒントがほしい。`),
        text: T(`The person has been stuck in the hotel for a long time...`, `その人物は、もう長い間このホテルに閉じ込められている……`),
      },
      {
        id: 'hxzz4c', wish: 'attract',
        question: T(`What scene is this related to?`, `どの場面に関係がある？`),
        text: T(`A good starting point is the Dining Room scene at 8am.`, `まずは8時のダイニングルームの場面から調べるといい。`),
      },
      {
        id: 'hk41c1', wish: 'streamer', needs: ['movie@15'],
        question: T(`How do I figure out the owner of this wish? (Part 1)`, `この願いの持ち主はどうやって分かる？ #1`),
        text: T(`Have you come across a streamer with a lot of subscribers?`, `大人気の配信者を、どこかで見かけなかっただろうか？`),
      },
      {
        id: 'hduea5', wish: 'streamer', needs: ['hint:hk41c1'],
        question: T(`Where should I look?`, `どこを調べればいい？`),
        text: T(`Check out the Movie Room scene at 3pm.`, `15時のシアタールームの場面を見てみよう。`),
      },
      {
        id: 'hcah2z', wish: 'two',
        question: T(`How do I figure out the owner of this wish?`, `この願いの持ち主はどうやって分かる？`),
        text: T(`This one is a bit tricky. There is a person who was in two places simultaneously yesterday. You might want to keep this in mind and approach this from some other angle.`, `これはちょっと難しい。昨日、同時に二か所にいた人物がいる。このことを頭に入れたうえで、別の方向から考えてみよう。`),
      },
      {
        id: 'hkarew', wish: 'fly',
        question: T(`How should I start?`, `何から始めればいい？`),
        text: T(`Think about different ways this wish could be satisfied.`, `この願いが叶う方法を、色々考えてみよう。`),
      },
      {
        id: 'hc082v', wish: 'fly', needs: ['hint:hkarew'],
        question: T(`I still don't understand their wish.`, `この願いの意味が、まだよく分からない。`),
        text: T(`The wish was satisfied literally. You might have seen the guest with their wish satisfied in several scenes.`, `願いは文字通りに叶えられた。願いが叶った後の姿を、いくつかの場面で見かけているかもしれない。`),
      },
      {
        id: 'hwbiu2', wish: 'alone', needs: ['skill:memory'],
        question: T(`Where should I look?`, `どこを調べればいい？`),
        text: T(`Check the Lobby scene at 1pm yesterday.`, `昨日の13時のロビーの場面を見てみよう。`),
      },
      {
        id: 'h7nav4', wish: 'alone', needs: ['paper:secrets'],
        question: T(`How do I know their room number?`, `この人物の部屋番号はどうやって分かる？`),
        text: T(`You should know their floor number from the scene. Is there any note in your possession that allows you to deduce their room number?`, `その場面から、何階の部屋なのかは分かるはずだ。手元の資料の中に、部屋番号を割り出せるものはないだろうか？`),
      },
      {
        id: 'hp6wjo', wish: 'chess', needs: ['skill:memory'],
        question: T(`Where should I look?`, `どこを調べればいい？`),
        text: T(`Check the Game Room scene at 4pm.`, `16時のゲームルームの場面を見てみよう。`),
      },
      {
        id: 'hw8i9t', wish: 'chess', needs: ['hint:hp6wjo'],
        question: T(`Who is the owner of the wish?`, `この願いの持ち主は誰？`),
        text: T(`The person who became the best chess player in the world yesterday. They are mentioned in the scene.`, `昨日、世界一のチェスプレイヤーになった人物だ。その場面で名前が出てくる。`),
      },
      {
        id: 'hv04t3', wish: 'young',
        question: T(`How should I start?`, `何から始めればいい？`),
        text: T(`Think about different ways this wish could be satisfied.`, `この願いが叶う方法を、色々考えてみよう。`),
      },
      {
        id: 'hbk94n', wish: 'fly', needs: ['hint:hc082v'],
        question: T(`I don't understand the previous hint. Can you be more specific?`, `前のヒントがよく分からない。もう少し具体的に教えて。`),
        text: T(`The guest was flying in the hotel yesterday.`, `その宿泊客は、昨日ホテルの中を飛び回っていた。`),
      },
      {
        id: 'herpae', wish: 'fly', needs: ['hint:hbk94n'],
        question: T(`Just tell me who the guest is.`, `もう誰なのか教えて。`),
        text: T(`It is the bird.`, `あの鳥だ。`),
      },
      {
        id: 'hvs3a7', wish: 'fly',
        question: T(`I know who the guest is, but how do I figure out their name?`, `誰なのかは分かったけど、名前はどうやって分かる？`),
        text: T(`The bird left some traces behind in its room. Find that room.`, `鳥は自分の部屋に痕跡を残していった。その部屋を探そう。`),
      },
      {
        id: 'hgqf73', wish: 'young', needs: ['hint:hv04t3'],
        question: T(`I still don't understand their wish.`, `この願いの意味が、まだよく分からない。`),
        text: T(`The wish was satisfied literally. The person might have become younger than they wished for, though...`, `願いは文字通りに叶えられた。ただし、本人が望んだ以上に若返ってしまったのかもしれない……`),
      },
      {
        id: 'ha11d8', wish: 'young',
        question: T(`I know who this person is, but how do I figure out their name and room number? (Part 1)`, `誰なのかは分かったけど、名前と部屋番号はどうやって分かる？ #1`),
        text: T(`Start by revisiting the 7am scene in the Dining Room. It gives some information on when the person arrived at the hotel.`, `まずは7時のダイニングルームの場面を見直そう。その人物がいつホテルに来たのか、手がかりがある。`),
      },
      {
        id: 'h4iz0e', wish: 'young', needs: ['hint:ha11d8'],
        question: T(`I know who this person is, but how do I figure out their name and room number? (Part 2)`, `誰なのかは分かったけど、名前と部屋番号はどうやって分かる？ #2`),
        text: T(`The room number can be found by visiting the rooms near where the chess player died.

The name can be figured out using the check-in times and process of elimination.`, `部屋番号は、チェスプレイヤーが殺された部屋の周りを調べれば分かる。

名前は、チェックイン時刻と消去法で割り出せる。`),
      },
      {
        id: 'hdrlia', wish: 'richest', needs: ['skill:memory'],
        question: T(`Where should I look?`, `どこを調べればいい？`),
        text: T(`Check the Common Room scene at 11am.`, `11時の談話室の場面を見てみよう。`),
      },
      {
        id: 'ha2ok2', wish: 'richest', needs: ['dining', 'hint:hdrlia'],
        question: T(`What other hints are there for this person?`, `この人物について、他にヒントはある？`),
        text: T(`They are one of the seven sins who were killed. You can find information about this person by tracing the footsteps of another character.`, `この人物は、殺された七つの大罪の一人だ。別の登場人物の足取りを辿ると、手がかりが見つかる。`),
      },
      {
        id: 'h1s4l8', wish: 'richest', needs: ['hint:ha2ok2'],
        question: T(`Can you give another place to start looking?`, `他に手がかりを探せる場所はある？`),
        text: T(`They were also in the Dining Room scene at 12pm.`, `この人物は、12時のダイニングルームの場面にも登場している。`),
      },
      {
        id: 'h46j4b', wish: 'richest', needs: ['hint:h1s4l8'],
        question: T(`Where else could I look?`, `他にどこを調べればいい？`),
        text: T(`They mentioned in the Dining Room scene at 12pm that their room is next to the Sin of Gluttony's room. You might want to look at the Sin of Gluttony's room (and the rooms around it).`, `12時のダイニングルームの場面で、自分の部屋は暴食の罪人の隣だと言っている。暴食の罪人の部屋と、その周りを調べてみよう。`),
      },
      {
        id: 'hl1tqh', wish: 'richest',
        question: T(`I know what room they are in. How can I figure out their name?`, `部屋は分かった。名前はどうやって分かる？`),
        text: T(`You can figure it out via process of elimination using their check-in time.`, `チェックイン時刻を使えば、消去法で割り出せる。`),
      },
      {
        id: 'hvuz5x', wish: 'famous',
        question: T(`How should I start?`, `何から始めればいい？`),
        text: T(`This one is a bit tricky. Think about different ways this wish could be satisfied.`, `これはちょっと難しい。この願いが叶う方法を、色々考えてみよう。`),
      },
      {
        id: 'hkhix5', wish: 'famous', needs: ['hint:hvuz5x'],
        question: T(`I still don't understand their wish.`, `この願いの意味が、まだよく分からない。`),
        text: T(`The wish was satisfied literally. They **turned into** a famous person.`, `願いは文字通りに叶えられた。この人物は、有名人**そのものになった**のだ。`),
      },
      {
        id: 'ht4ppl', wish: 'famous', needs: ['hint:hkhix5'],
        question: T(`Any hints on how to deduce who they are?`, `誰なのかを推理するヒントはある？`),
        text: T(`They acted strangely after turning into a famous person.`, `有名人になった後、この人物の様子はどこかおかしかった。`),
      },
      {
        id: 'hqhpyd', wish: 'famous', needs: ['hint:ht4ppl'],
        question: T(`Where is that scene?`, `それはどの場面？`),
        text: T(`Check the Dining Room scene at 5pm.`, `17時のダイニングルームの場面を見てみよう。`),
      },
      {
        id: 'hnneak', wish: 'famous', needs: ['paper:secrets'],
        question: T(`I can't figure out the person's room!`, `この人物の部屋が分からない！`),
        text: T(`Make sure you have checked all the rooms mentioned in the Secrets of the Hotel paper.`, `「ホテルの秘密」に出てくる部屋は、全て調べただろうか？`),
      },
      {
        id: 'h9q3kt', wish: 'prophet', needs: ['skill:memory'],
        question: T(`Where should I start?`, `何から始めればいい？`),
        text: T(`Someone shared their revelations in several scenes yesterday.`, `昨日、ある人物がいくつもの場面で自分の預言を語っている。`),
      },
      {
        id: 'hw11q3', wish: 'prophet', needs: ['hint:h9q3kt'],
        question: T(`How can I figure out their room number?`, `この人物の部屋番号はどうやって分かる？`),
        text: T(`They mention their room number in the Common Room scene at 3pm.`, `15時の談話室の場面で、自分の部屋番号を言っている。`),
      },
      {
        id: 'himxs1', wish: 'prophet', needs: ['hint:hw11q3'],
        question: T(`How can I figure out their name?`, `この人物の名前はどうやって分かる？`),
        text: T(`You can figure out their approximate check-in time from the scene. Then, use process of elimination to figure out their name.`, `その場面から、おおよそのチェックイン時刻が分かる。あとは消去法で名前を割り出そう。`),
      },
      {
        id: 'hqylm5', wish: 'revive',
        question: T(`How should I start?`, `何から始めればいい？`),
        text: T(`The wish was granted. The wife is in the hotel.`, `この願いは叶っている。妻は今、このホテルにいる。`),
      },
      {
        id: 'hu0iqx', wish: 'revive',
        question: T(`How do I figure out the owner of this wish? (Part 1)`, `この願いの持ち主はどうやって分かる？ #1`),
        text: T(`There is a person in the hotel not on the Guest List. Where could they have come from?`, `宿泊客名簿に載っていない人物が、ホテルにいる。その人はどこから来たのだろう？`),
      },
      {
        id: 'hufahn', wish: 'revive', needs: ['hint:hu0iqx', 'skill:memory'],
        question: T(`How do I figure out the owner of this wish? (Part 2)`, `この願いの持ち主はどうやって分かる？ #2`),
        text: T(`Someone in the Common Room at 11am explains why they came to the hotel.`, `11時の談話室で、ある人物がホテルに来た理由を話している。`),
      },
      {
        id: 'hrt8mr', wish: 'revive', needs: ['hint:hu0iqx'],
        question: T(`How do I figure out the room number of the owner of this wish?`, `この願いの持ち主の部屋番号はどうやって分かる？`),
        text: T(`Whoever brought her back checked into the room she woke up in.`, `彼女を生き返らせた人物は、彼女が目を覚ました部屋にチェックインしていた。`),
      },
      {
        id: 'htmd77', wish: 'troubles',
        question: T(`How should I start?`, `何から始めればいい？`),
        text: T(`Think about different ways this wish could be satisfied.`, `この願いが叶う方法を、色々考えてみよう。`),
      },
      {
        id: 'hdob4i', wish: 'troubles', needs: ['game', 'hint:hoc2t1'],
        question: T(`How do I figure out the owner of this wish?`, `この願いの持ち主はどうやって分かる？`),
        text: T(`It is one of the amnesiacs.`, `記憶をなくした人物の一人だ。`),
      },
      {
        id: 'h8iptm', wish: 'troubles', needs: ['hint:hdob4i'],
        question: T(`How do I figure out the room number of the owner of this wish?`, `この願いの持ち主の部屋番号はどうやって分かる？`),
        text: T(`They told you their room number.`, `本人が部屋番号を教えてくれた。`),
      },
      {
        id: 'h73w4c', wish: 'job',
        question: T(`How should I start?`, `何から始めればいい？`),
        text: T(`Someone got a job yesterday. We have probably seen this person.`, `昨日、ある人物が仕事に就いた。その人物には、恐らくもう会っている。`),
      },
      {
        id: 'hksdvi', wish: 'job', needs: ['lobby', 'hint:hh85qt'],
        question: T(`How do I figure out the owner of this wish?`, `この願いの持ち主はどうやって分かる？`),
        text: T(`When did they start their job? The front desk comes up in more than one scene from yesterday evening. Pay attention to who was working there and their gender. Then use the check-in times and process of elimination to get their name.`, `その人物は、いつから働き始めたのだろう？ 昨日の夜には、フロントが話題に出る場面がいくつかある。そこで誰が働いていたのか、その人の性別にも注目しよう。あとはチェックイン時刻と消去法で名前を割り出せる。`),
      },
      {
        id: 'hoe6po', wish: 'job', needs: ['lobby', 'hint:hh85qt'],
        question: T(`How do I figure out the room number of the owner of this wish?`, `この願いの持ち主の部屋番号はどうやって分かる？`),
        text: T(`Look closely near where they are currently working.`, `今働いている場所の近くを、よく調べてみよう。`),
      },
      {
        id: 'hpl3kx', wish: 'minds', needs: ['skill:memory'],
        question: T(`Where should I look?`, `どこを調べればいい？`),
        text: T(`Check the Game Room late in the evening.`, `夜遅くのゲームルームを見てみよう。`),
      },
      {
        id: 'hdqs9l', wish: 'minds', needs: ['hint:hpl3kx'],
        question: T(`How do I figure out the owner of this wish?`, `この願いの持ち主はどうやって分かる？`),
        text: T(`Someone at the mahjong table knows what the others are holding. Someone at the poker table knows their opponent's hand.`, `麻雀卓に、他の人の手牌を見抜いているような人物がいる。ポーカーでも、相手の手札が分かっているかのような人物がいる。`),
      },
      {
        id: 'h5ljyi', wish: 'minds', needs: ['hint:hdqs9l'],
        question: T(`How do I figure out the room number of the owner of this wish?`, `この願いの持ち主の部屋番号はどうやって分かる？`),
        text: T(`The big winner at poker asks for their winnings to be sent somewhere.`, `ポーカーで大勝ちした人物が、勝ち分をどこかへ届けるよう頼んでいる。`),
      },
      {
        id: 'hsg242', wish: 'daughter', needs: ['skill:memory'],
        question: T(`Where should I look?`, `どこを調べればいい？`),
        text: T(`Check the Movie Room scenes in the past.`, `昨日のシアタールームの場面を見てみよう。`),
      },
      {
        id: 'hk31f6', wish: 'daughter', needs: ['hint:hsg242', 'movie@17'],
        question: T(`How do I figure out the owner of this wish? (Part 1)`, `この願いの持ち主はどうやって分かる？ #1`),
        text: T(`Where did they go after the Movie Room? Check the Dining Room at 6pm.`, `シアタールームの後、その人物はどこへ行っただろう？ 18時のダイニングルームを見てみよう。`),
      },
      {
        id: 'hhiff5', wish: 'daughter', needs: ['hint:hk31f6', 'dining@18'],
        question: T(`How do I figure out the owner of this wish? (Part 2)`, `この願いの持ち主はどうやって分かる？ #2`),
        text: T(`They are told where and when to find the person they are looking for. Check that place at that time.`, `その人物は、探している相手に会える時刻と場所を教えてもらう。その時刻に、その場所を見てみよう。`),
      },
      {
        id: 'ho4cll', wish: 'daughter', needs: ['hint:hsg242'],
        question: T(`How do I figure out the room number of the owner of this wish?`, `この願いの持ち主の部屋番号はどうやって分かる？`),
        text: T(`They said their room number in the Movie Room at 4pm.`, `16時のシアタールームで、自分の部屋番号を言っている。`),
      },
      {
        id: 'hzjmbj', wish: 'animals', needs: ['skill:memory'],
        question: T(`Where should I look?`, `どこを調べればいい？`),
        text: T(`Have you seen anyone with an animal in yesterday's scenes?`, `昨日の場面で、動物を連れている人を見かけなかっただろうか？`),
      },
      {
        id: 'hwwhw3', wish: 'animals', needs: ['hint:hzjmbj'],
        question: T(`How do I figure out the owner of this wish?`, `この願いの持ち主はどうやって分かる？`),
        text: T(`Check the Lobby scene at 8pm. The receptionist names her.`, `20時のロビーの場面を見てみよう。フロント係が彼女の名前を口にしている。`),
      },
      {
        id: 'hb2bfc', wish: 'animals', needs: ['hint:hwwhw3'],
        question: T(`How do I figure out the room number of the owner of this wish?`, `この願いの持ち主の部屋番号はどうやって分かる？`),
        text: T(`Someone in the Common Room at 3pm saw her neighbor talking to a bird.`, `15時の談話室で、隣の部屋の人が鳥と話していたと言っている人物がいる。`),
      },
      {
        id: 'hzpnmg', wish: 'fun',
        question: T(`How do I figure out the owner of this wish? (Part 1)`, `この願いの持ち主はどうやって分かる？ #1`),
        text: T(`Who could possibly have this wish? If you don't have any ideas right now, feel free to come back to this later.`, `こんな願いを持っていそうなのは誰だろう？ 今は思い付かなくても、後で戻ってくれば大丈夫。`),
      },
      {
        id: 'h7zvoh', wish: 'fun', needs: ['hint:hzpnmg'],
        question: T(`How do I figure out the owner of this wish? (Part 2)`, `この願いの持ち主はどうやって分かる？ #2`),
        text: T(`Are you having fun?`, `今、このゲームを楽しんでる？`),
      },
      {
        id: 'h1fhg2', wish: 'infinite',
        question: T(`How should I start?`, `何から始めればいい？`),
        text: T(`Every wish here is made at check-in. How would the hotel grant someone more wishes?`, `このホテルでは、願いはチェックインのときに伝える。もっと多くの願いを叶えてもらうには、どうすればいいだろう？`),
      },
      {
        id: 'h27q9z', wish: 'infinite', needs: ['hint:h1fhg2'],
        question: T(`How do I figure out the owner of this wish?`, `この願いの持ち主はどうやって分かる？`),
        text: T(`This person checked in more than once. They even checked in today.`, `この人物は、何度もチェックインしている。今日もチェックインしていた。`),
      },
      {
        id: 'h3mkgs', wish: 'infinite', needs: ['paper:secrets'],
        question: T(`How do I figure out the room number of the owner of this wish?`, `この願いの持ち主の部屋番号はどうやって分かる？`),
        text: T(`Which room has seen death after death?`, `死が何度も繰り返されている部屋はどこだろう？`),
      },
      {
        id: 'hmier8', wish: 'gender',
        question: T(`How should I start?`, `何から始めればいい？`),
        text: T(`The Guest List shows each guest's gender when they check in. Does anyone in the scenes not match?`, `宿泊客名簿には、チェックインしたときの性別が書かれている。場面の中で、名簿と合わない人物はいないだろうか？`),
      },
      {
        id: 'hduz1o', wish: 'gender', needs: ['hint:hmier8', 'skill:memory'],
        question: T(`How do I figure out the owner of this wish? (Part 1)`, `この願いの持ち主はどうやって分かる？ #1`),
        text: T(`Check the Dining Room scene at 8am. Listen to what one of the diners says about men.`, `8時のダイニングルームの場面を見てみよう。食事をしている一人が、男性について何と言っているかに注目しよう。`),
      },
      {
        id: 'h78aog', wish: 'gender', needs: ['hint:hduz1o'],
        question: T(`How do I figure out the owner of this wish? (Part 2)`, `この願いの持ち主はどうやって分かる？ #2`),
        text: T(`Use the check-in time to figure out who they are.`, `チェックイン時刻を使って、誰なのかを割り出そう。`),
      },
      {
        id: 'hqqbgx', wish: 'gender', needs: ['hint:hduz1o'],
        question: T(`How do I figure out the room number of the owner of this wish?`, `この願いの持ち主の部屋番号はどうやって分かる？`),
        text: T(`That person tells someone their room number in the Common Room at 3pm.`, `その人物は、15時の談話室で自分の部屋番号を伝えている。`),
      },
      {
        id: 'hs1oth', wish: 'forever', needs: ['skill:memory'],
        question: T(`Where can I find this person?`, `この人物はどこで見つかる？`),
        text: T(`Someone who never has to work again can spend every day doing nothing at all. Which of the seven deadly sins does that sound like? Listen for anyone who mentions that sin, and where it will be.`, `もう二度と働かなくていい人は、毎日何もせずに過ごせる。それは七つの大罪のどれに似ているだろう？ その罪の名前と、それがどこにあるのかを口にしている人物を探そう。`),
      },
      {
        id: 'h042im', wish: 'forever', needs: ['hint:hs1oth', 'common@17'],
        question: T(`How do I figure out the owner of this wish?`, `この願いの持ち主はどうやって分かる？`),
        text: T(`Someone predicted where Sloth would die. Visit that room at the right hour.`, `怠惰の罪人がどこで死ぬかを預言した人がいる。その部屋を、ちょうどいい時刻に見てみよう。`),
      },
      {
        id: 'hlbmns', wish: 'forever', needs: ['hint:h042im'],
        question: T(`How do I figure out the room number of the owner of this wish?`, `この願いの持ち主の部屋番号はどうやって分かる？`),
        text: T(`It is where they died.`, `その人物が死んだ場所だ。`),
      },
      {
        id: 'hhtep6', wish: 'invisible', needs: ['skill:memory'],
        question: T(`How should I start?`, `何から始めればいい？`),
        text: T(`Have you noticed anything strange about the shootings?`, `銃撃事件について、何か妙なことに気づかなかっただろうか？`),
      },
      {
        id: 'hyl6om', wish: 'invisible', needs: ['hint:hhtep6'],
        question: T(`How do I figure out the owner of this wish? (Part 1)`, `この願いの持ち主はどうやって分かる？ #1`),
        text: T(`In every shooting, you hear the gun but never see the shooter.`, `どの銃撃でも、銃声は聞こえるのに、撃った人の姿は見えない。`),
      },
      {
        id: 'hyt5yk', wish: 'invisible', needs: ['hint:hyl6om'],
        question: T(`How do I figure out the owner of this wish? (Part 2)`, `この願いの持ち主はどうやって分かる？ #2`),
        text: T(`Who is behind the killings of the sins? Where are they right now? You might need to come back to this after you have identified most of the other characters.`, `罪人たちを殺して回っているのは誰だろう？ その人物は今どこにいる？ 他の宿泊客をほとんど特定してから、また戻ってくるといいかもしれない。`),
      },
      {
        id: 'hb90w1', wish: 'invisible', needs: ['hint:hyt5yk', '8484@20'],
        question: T(`How do I figure out the room number of the owner of this wish?`, `この願いの持ち主の部屋番号はどうやって分かる？`),
        text: T(`Check the place where Wrath died last night. Who opened the door before anyone arrived?`, `昨夜、憤怒の罪人が死んだ場所を見てみよう。誰かが来る前に扉を開けたのは、誰だろう？`),
      },
      {
        id: 'h8u6n3', wish: 'own',
        question: T(`How do I figure out the owner of this wish? (Part 1)`, `この願いの持ち主はどうやって分かる？ #1`),
        text: T(`Ask the receptionist about the hotel's owner.`, `フロント係に、ホテルのオーナーについて聞いてみよう。`),
      },
      {
        id: 'hctmto', wish: 'own', needs: ['hint:h8u6n3'],
        question: T(`How do I figure out the owner of this wish? (Part 2)`, `この願いの持ち主はどうやって分かる？ #2`),
        text: T(`Look at the Check-in List and the Guest List. Whose name sounds familiar?`, `チェックイン一覧と宿泊客名簿を見てみよう。聞き覚えのある名前はないだろうか？`),
      },
      {
        id: 'hf8z3c', wish: 'own', needs: ['hint:hctmto', 'paper:secrets'],
        question: T(`How do I figure out the room number of the owner of this wish?`, `この願いの持ち主の部屋番号はどうやって分かる？`),
        text: T(`The receptionist told you which floor the boss lives on. The Secrets of the Hotel paper tells you which room is on that floor.`, `フロント係は、上司が何階に住んでいるかを教えてくれた。「ホテルの秘密」を見れば、その階にある部屋が分かる。`),
      },
      {
        id: 'h423yf', wish: 'secrets', needs: ['!paper:secrets'],
        question: T(`Where should I look?`, `どこを調べればいい？`),
        text: T(`You do not have enough information to solve this right now.`, `今はまだ、これを解くための情報が足りない。`),
      },
      {
        id: 'ht97io', wish: 'secrets', needs: ['paper:secrets'],
        question: T(`How do I figure out the owner of this wish?`, `この願いの持ち主はどうやって分かる？`),
        text: T(`Who could have written down all these secrets? Where did you find the paper?`, `こんな秘密を全て書き留められたのは誰だろう？ その紙はどこで見つけた？`),
      },
      {
        id: 'hl6yyn', wish: 'secrets', needs: ['hint:ht97io', 'skill:memory'],
        question: T(`How do I figure out who wrote it?`, `書いたのが誰か、どうやって分かる？`),
        text: T(`Check Room 3333360 with the Memory Device.`, `記憶装置で3333360号室を調べてみよう。`),
      },
      {
        id: 'hjz5x3', wish: 'god',
        question: T(`How should I start?`, `何から始めればいい？`),
        text: T(`Think about where God might be. How could the hotel bring someone closer?`, `神様はどこにいるのだろう？ ホテルは、どうやって人を神様に近づけるだろう？`),
      },
      {
        id: 'h7girf', wish: 'god', needs: ['hint:hjz5x3'],
        question: T(`How do I figure out the owner of this wish?`, `この願いの持ち主はどうやって分かる？`),
        text: T(`Someone in this hotel is still getting closer to God at this very moment. Where are they?`, `このホテルには、今この瞬間も神様に近づき続けている人物がいる。その人物はどこにいる？`),
      },
      {
        id: 'h0vmi2', wish: 'god', needs: ['hint:h7girf', 'paper:secrets'],
        question: T(`How do I figure out the room number of the owner of this wish?`, `この願いの持ち主の部屋番号はどうやって分かる？`),
        text: T(`Where is their room? What properties must their room number have?`, `その人物の部屋はどこにあるのだろう？ その部屋番号は、どんな条件を満たしていなければならないだろう？`),
      },
      {
        id: 'h6ohsc', wish: 'revive', needs: ['hint:hufahn'],
        question: T(`How do I figure out the owner of this wish? (Part 3)`, `この願いの持ち主はどうやって分かる？ #3`),
        text: T(`Use their check-in time and process of elimination.`, `チェックイン時刻と消去法を使おう。`),
      },
      {
        id: 'hoc2t1', wish: 'troubles', needs: ['hint:htmd77'],
        question: T(`I still don't understand their wish.`, `この願いの意味が、まだよく分からない。`),
        text: T(`What is one way to forget all the troubles in life? Did any character show signs that might be related to this?`, `人生のあらゆる悩みを忘れるには、どんな方法があるだろう？ それらしい様子を見せていた人はいなかっただろうか？`),
      },
      {
        id: 'hhnyyb', wish: 'troubles', needs: ['hint:hdob4i'],
        question: T(`I still can't figure out the name of the owner of the wish.`, `この願いの持ち主の名前が、まだ分からない。`),
        text: T(`They are the person in the Game Room today. Their muscle memory might hint who they are.`, `今日ゲームルームにいる人物だ。体が覚えていることが、正体のヒントになるかもしれない。`),
      },
      {
        id: 'hh85qt', wish: 'job', needs: ['hint:h73w4c'],
        question: T(`Can you be a bit more specific?`, `もう少し具体的に教えて。`),
        text: T(`The person is currently working at the hotel.`, `その人物は、今このホテルで働いている。`),
      },
      {
        // Until Chuck is confirmed; hm2qk7 below takes its place after that.
        id: 'h8ddwi', wish: 'god', needs: ['hint:h7girf', '!confirmed:chuck'],
        question: T(`How do I know their name?`, `この人物の名前はどうやって分かる？`),
        text: T(`When could they have checked in? One of the scenes shows that someone else was at their current location. That narrows it down, but not all the way. You need to figure out another person's wish first.`, `いつチェックインできたのだろう？ ある場面を見ると、その人物が今いる場所に、以前は別の誰かがいたことが分かる。ただ、それだけでは絞り切れない。先に別の人物の願いを突き止める必要がある。`),
      },
      {
        // h8ddwi without the hedge, once Chuck (the other candidate) is
        // confirmed and elimination finishes the job. A player who already read h8ddwi keeps it instead.
        id: 'hm2qk7', wish: 'god', needs: ['hint:h7girf', 'confirmed:chuck', '!hint:h8ddwi'],
        question: T(`How do I know their name?`, `この人物の名前はどうやって分かる？`),
        text: T(`When could they have checked in? One of the scenes shows that someone else was at their current location. Use the check-in times and process of elimination.`, `いつチェックインできたのだろう？ ある場面を見ると、その人物が今いる場所に、以前は別の誰かがいたことが分かる。チェックイン時刻と消去法を使おう。`),
      },
      {
        id: 'hqz6t7', wish: 'god', needs: ['hint:h7girf'],
        question: T(`I still cannot figure out where the owner of this wish is. Can you be more direct?`, `持ち主がどこにいるのか、まだ分からない。もっとはっきり教えて。`),
        text: T(`They are physically moving upwards.`, `その人物は、比喩ではなく実際に、上へと昇り続けている。`),
      },
      {
        id: 'h7dt2l', wish: 'minds', needs: ['hint:h5ljyi'],
        question: T(`How do I figure out their name?`, `この人物の名前はどうやって分かる？`),
        text: T(`When did they check in? Two guests checked in during that hour. Place the other one first, and this one is whoever is left.`, `いつチェックインしたのだろう？ その時間帯にチェックインしたのは二人だけだ。先にもう一人を特定すれば、残った方がこの人物だ。`),
      },
      {
        id: 'hm5d8w', guest: 'nigel', needs: ['game@16'],
        question: T(`How do I figure out his wish and room number?`, `羽生直樹の願いと部屋番号はどうやって分かる？`),
        text: T(`His name is mentioned in the Game Room at 4pm. Have you seen anyone who could be Nigel? Once you figure out who he is, the rest will fall into place.`, `16時のゲームルームで、彼の名前が出てくる。羽生直樹かもしれない人物に、心当たりはないだろうか？ 彼が誰なのか分かれば、あとは自然と解けるはずだ。`),
      },
      {
        id: 'htahqz', guest: 'mark', needs: ['skill:memory'],
        question: T(`How do I figure out his room number?`, `青木大輔の部屋番号はどうやって分かる？`),
        text: T(`The boss suggested a few rooms to visit. Check what is inside each of them.`, `上司は、いくつかの部屋を調べるよう勧めていた。それぞれの部屋に何があるか、確認しよう。`),
      },
      {
        id: 'h0vy8r', guest: 'mark', needs: ['5'],
        question: T(`How do I figure out his wish?`, `青木大輔の願いはどうやって分かる？`),
        text: T(`His suitcase is in his room, but he isn't. Take a closer look at what else is in there. Have you seen anything in the hotel that could have left that behind?`, `部屋にはスーツケースが残っているのに、本人はいない。部屋の中をもう少しよく見てみよう。あれを残していきそうなものを、ホテルのどこかで見かけなかっただろうか？`),
      },
      {
        id: 'houh68', guest: 'gabriel', needs: ['4'],
        question: T(`How should I start?`, `何から始めればいい？`),
        text: T(`Is there anyone else on the Guest List who might be related to him?`, `宿泊客名簿に、彼と関係がありそうな人はいないだろうか？`),
      },
      {
        id: 'haygtj', guest: 'gabriel', needs: ['hint:houh68', 'skill:memory'],
        question: T(`How do I figure out his wish? (Part 1)`, `木村健二の願いはどうやって分かる？ #1`),
        text: T(`Check the Room 4 scene at 7pm.`, `19時の4号室の場面を見てみよう。`),
      },
      {
        id: 'hnfr2n', guest: 'gabriel', needs: ['hint:haygtj', '4@19'],
        question: T(`How do I figure out his wish? (Part 2)`, `木村健二の願いはどうやって分かる？ #2`),
        text: T(`What did the man come to the hotel for? Follow him back through the Dining Room and the Movie Room.`, `その男性は、何のためにホテルに来たのだろう？ ダイニングルームやシアタールームの場面まで遡って、彼の足取りを辿ろう。`),
      },
      {
        id: 'hb79ag', guest: 'gabriel', needs: ['hint:hnfr2n'],
        question: T(`How do I figure out his room number?`, `木村健二の部屋番号はどうやって分かる？`),
        text: T(`He tells someone his room number in the Movie Room at 4pm.`, `16時のシアタールームで、彼は自分の部屋番号を伝えている。`),
      },
      {
        id: 'hw52l2', guest: 'emily', needs: ['skill:memory'],
        question: T(`How should I start?`, `何から始めればいい？`),
        text: T(`Her name comes up in one of yesterday's Lobby scenes.`, `昨日のロビーの場面で、彼女の名前が出てくる。`),
      },
      {
        id: 'hl3ud4', guest: 'emily', needs: ['hint:hw52l2'],
        question: T(`How do I figure out her wish?`, `小鳥遊莉花の願いはどうやって分かる？`),
        text: T(`Check the Lobby at 8pm. Who is she talking to?`, `20時のロビーを見てみよう。彼女は誰と話している？`),
      },
      {
        id: 'h6bi6d', guest: 'emily', needs: ['hint:hl3ud4', 'common@15'],
        question: T(`How do I figure out her room number? (Part 1)`, `小鳥遊莉花の部屋番号はどうやって分かる？ #1`),
        text: T(`Someone in the Common Room at 3pm complains about a neighbor. Could that be her?`, `15時の談話室で、隣の部屋の人について愚痴をこぼしている人物がいる。それは彼女のことでは？`),
      },
      {
        id: 'hvzw5b', guest: 'emily', needs: ['hint:h6bi6d'],
        question: T(`How do I figure out her room number? (Part 2)`, `小鳥遊莉花の部屋番号はどうやって分かる？ #2`),
        text: T(`Visit the rooms on either side of that person's room. Is there any sign of a bird?`, `その人物の部屋の両隣を訪ねてみよう。鳥がいた形跡はないだろうか？`),
      },
      {
        id: 'h036vr', guest: 'helen', needs: ['skill:memory'],
        question: T(`How should I start?`, `何から始めればいい？`),
        text: T(`She is the only guest who checked in at 9am. Is there a scene at that hour where someone has just arrived?`, `9時台にチェックインしたのは彼女だけだ。その時刻に、誰かが到着したばかりの場面はないだろうか？`),
      },
      {
        id: 'h4e5ht', guest: 'helen', needs: ['hint:h036vr', 'skill:memory'],
        question: T(`How do I figure out her wish? (Part 1)`, `冬坂春菜の願いはどうやって分かる？ #1`),
        text: T(`Check Room 40 at 9am. Who greets their new neighbor?`, `9時の40号室を見てみよう。新しいお隣さんに声をかけているのは誰だろう？`),
      },
      {
        id: 'hfmgie', guest: 'helen', needs: ['hint:h4e5ht', '40@9'],
        question: T(`How do I figure out her wish? (Part 2)`, `冬坂春菜の願いはどうやって分かる？ #2`),
        text: T(`Does the neighbor sound like someone from another scene? Check the Common Room at 11am.`, `そのお隣さんの話し方は、別の場面の誰かに似ていないだろうか？ 11時の談話室を見てみよう。`),
      },
      {
        id: 'hyzysz', guest: 'helen', needs: ['hint:h4e5ht', '40@9'],
        question: T(`How do I figure out her room number?`, `冬坂春菜の部屋番号はどうやって分かる？`),
        text: T(`She is Dominique's neighbor. Check the rooms on both sides of Room 40, and think about where she ran to after lunch.`, `彼女は田中博の隣人だ。40号室の両隣を調べて、昼食の後に彼女がどこへ駆け込んだのかを考えよう。`),
      },
      {
        id: 'hfgcx7', guest: 'you',
        question: T(`How do I figure out my room number? (Part 1)`, `自分の部屋番号はどうやって分かる？ #1`),
        text: T(`Reread the prologue. Where is your room compared to Room 76?`, `プロローグを読み返そう。自分の部屋は、76号室から見てどこにある？`),
      },
      {
        id: 'hjmsuv', guest: 'you', needs: ['hint:hfgcx7'],
        question: T(`How do I figure out my room number? (Part 2)`, `自分の部屋番号はどうやって分かる？ #2`),
        text: T(`Try the warp device on the rooms just after 76.`, `76号室のすぐ先の部屋へ、ワープ装置で移動してみよう。`),
      },
      {
        id: 'h3gw31', guest: 'you',
        question: T(`How do I figure out my wish?`, `自分の願いはどうやって分かる？`),
        text: T(`Look at the list of remaining wishes and think about which one would make sense.`, `残っている願いの一覧を見て、どれなら筋が通るか考えてみよう。`),
      },
      {
        id: 'h8r966', guest: 'lorenzo',
        question: T(`How should I start?`, `何から始めればいい？`),
        text: T(`Look at the Check-in List carefully. Is there anything strange about his name?`, `チェックイン一覧をよく見てみよう。彼の名前に、何か変わったところはないだろうか？`),
      },
      {
        id: 'hd9kwu', guest: 'lorenzo', needs: ['hint:h8r966'],
        question: T(`How do I figure out his wish? (Part 1)`, `ロレンツォ・コンティの願いはどうやって分かる？ #1`),
        text: T(`Why would someone need to check in over and over?`, `何度もチェックインする理由は、何だろう？`),
      },
      {
        id: 'h2vvmy', guest: 'lorenzo', needs: ['hint:hd9kwu', 'lobby'],
        question: T(`How do I figure out his wish? (Part 2)`, `ロレンツォ・コンティの願いはどうやって分かる？ #2`),
        text: T(`Visit the Lobby a few times. Someone keeps checking in, even today.`, `ロビーに何度か行ってみよう。今日も、誰かがチェックインを繰り返している。`),
      },
      {
        id: 'hti8k6', guest: 'lorenzo', needs: ['hint:hd9kwu', 'paper:secrets'],
        question: T(`How do I figure out his room number?`, `ロレンツォ・コンティの部屋番号はどうやって分かる？`),
        text: T(`One of the lines in the Secrets of the Hotel paper fits someone who keeps dying and coming back.`, `「ホテルの秘密」の中に、何度死んでも戻ってくる人物のことを指していそうな一文がある。`),
      },
      {
        id: 'hvc0sq', guest: 'taylor', needs: ['skill:memory'],
        question: T(`How should I start?`, `何から始めればいい？`),
        text: T(`Taylor's name comes up in the Dining Room scene at 8am.`, `8時のダイニングルームの場面で、和泉千尋の名前が出てくる。`),
      },
      {
        id: 'hroj39', guest: 'taylor', needs: ['hint:hvc0sq'],
        question: T(`How do I figure out their wish?`, `和泉千尋の願いはどうやって分かる？`),
        text: T(`Compare what Taylor says with the Guest List.`, `千尋の発言を、宿泊客名簿と比べてみよう。`),
      },
      {
        id: 'hawjlz', guest: 'taylor', needs: ['hint:hvc0sq'],
        question: T(`How do I figure out their room number?`, `和泉千尋の部屋番号はどうやって分かる？`),
        text: T(`Taylor tells people their room number more than once. Check the Common Room at 3pm.`, `千尋は、何度か自分の部屋番号を伝えている。15時の談話室を見てみよう。`),
      },
      {
        id: 'htzatu', guest: 'jacob', needs: ['skill:memory'],
        question: T(`How should I start?`, `何から始めればいい？`),
        text: T(`He is the only guest who checked in at 8am. Is there a scene at that hour where someone has just checked in?`, `8時台にチェックインしたのは彼だけだ。その時刻に、チェックインを済ませたばかりの人物が出てくる場面はないだろうか？`),
      },
      {
        id: 'hpawh9', guest: 'jacob', needs: ['hint:htzatu'],
        question: T(`How do I figure out his wish?`, `渡辺哲也の願いはどうやって分かる？`),
        text: T(`Check the Dining Room at 8am. What happens when he meets the woman at the table?`, `8時のダイニングルームを見てみよう。テーブルにいた女性と出会ったとき、何が起きる？`),
      },
      {
        id: 'h07d4p', guest: 'jacob', needs: ['hint:hpawh9', 'dining@8'],
        question: T(`How do I figure out his room number? (Part 1)`, `渡辺哲也の部屋番号はどうやって分かる？ #1`),
        text: T(`He tells her where his room is in the Dining Room at 12pm.`, `12時のダイニングルームで、彼は彼女に自分の部屋の場所を教えている。`),
      },
      {
        id: 'hssr2h', guest: 'jacob', needs: ['hint:h07d4p'],
        question: T(`How do I figure out his room number? (Part 2)`, `渡辺哲也の部屋番号はどうやって分かる？ #2`),
        text: T(`His room is next to Taylor's. Check the rooms on both sides.`, `彼の部屋は千尋の隣だ。両隣の部屋を調べてみよう。`),
      },
      {
        id: 'h38mxa', guest: 'lisa', needs: ['skill:memory'],
        question: T(`How should I start?`, `何から始めればいい？`),
        text: T(`Lisa comes up in several of yesterday's scenes. Start with the Movie Room.`, `七海は、昨日のいくつかの場面に登場する。まずはシアタールームから見てみよう。`),
      },
      {
        id: 'hrshyr', guest: 'lisa', needs: ['hint:h38mxa'],
        question: T(`How do I figure out her wish?`, `五十嵐七海の願いはどうやって分かる？`),
        text: T(`Check the Movie Room at 3pm. What is on the screen?`, `15時のシアタールームを見てみよう。画面には何が映っている？`),
      },
      {
        id: 'hbtor1', guest: 'lisa', needs: ['hint:hrshyr', 'movie'],
        question: T(`I am pretty certain about my answer. Why is it incorrect?`, `答えには自信があるのに、どうして間違いなの？`),
        text: T(`Compare the Lisa you met today with the Dining Room scene at 5pm. Is there something weird going on?`, `今日会った七海と、17時のダイニングルームの場面を比べてみよう。何かおかしなことが起きていないだろうか？`),
      },
      {
        id: 'hlre4l', guest: 'lisa', needs: ['hint:hbtor1', 'paper:secrets'],
        question: T(`Then who is the Lisa I met today?`, `じゃあ、今日会った七海は誰なの？`),
        text: T(`Not the real one. Look at the Secrets of the Hotel paper: someone vanished the moment another guest's wish came true. Which wish could turn someone into Lisa?`, `本物の七海ではない。「ホテルの秘密」を見てみよう。別の客の願いが叶ったその瞬間に、姿を消した人がいる。誰かを七海に変えてしまえる願いは、どれだろう？`),
      },
      {
        id: 'h8h05l', guest: 'lisa', needs: ['paper:secrets'],
        question: T(`How do I figure out her room number?`, `五十嵐七海の部屋番号はどうやって分かる？`),
        text: T(`Check the Secrets of the Hotel paper. Someone disappeared in one of the rooms.`, `「ホテルの秘密」を確認しよう。ある部屋で、誰かが姿を消している。`),
      },
      {
        id: 'h0v1lh', guest: 'marie', needs: ['common'],
        question: T(`How should I start?`, `何から始めればいい？`),
        text: T(`Reread what she told you in the Common Room.`, `談話室で彼女が話していたことを、読み返してみよう。`),
      },
      {
        id: 'hbdikm', guest: 'marie', needs: ['hint:h0v1lh', 'skill:memory'],
        question: T(`How do I figure out her room number? (Part 1)`, `白石美月の部屋番号はどうやって分かる？ #1`),
        text: T(`Where was someone shot around 6pm yesterday? She is next door.`, `昨日の18時頃、誰かが撃たれたのはどこだろう？ 彼女の部屋はその隣だ。`),
      },
      {
        id: 'h5vcbj', guest: 'marie', needs: ['hint:hbdikm', '2049'],
        question: T(`How do I figure out her room number? (Part 2)`, `白石美月の部屋番号はどうやって分かる？ #2`),
        text: T(`There are two rooms next to it. Which one does someone still seem to be staying in?`, `その部屋の隣は二つある。今も誰かが泊まっていそうなのは、どちらだろう？`),
      },
      {
        id: 'hml5pn', guest: 'marie', needs: ['hint:h5vcbj'],
        question: T(`How do I figure out her wish? (Part 1)`, `白石美月の願いはどうやって分かる？ #1`),
        text: T(`Who was in Room 2050 at 6pm yesterday? Check the Dining Room.`, `昨日の18時、2050号室の宿泊客はどこにいただろう？ ダイニングルームを見てみよう。`),
      },
      {
        id: 'h5w8ge', guest: 'marie', needs: ['hint:hml5pn', 'dining@18'],
        question: T(`How do I figure out her wish? (Part 2)`, `白石美月の願いはどうやって分かる？ #2`),
        text: T(`She heard the shot from her room, but Room 2050's guest never left the dining table. How can both be true?`, `彼女は自分の部屋で銃声を聞いた。ところが2050号室の宿泊客は、ダイニングルームの席を一度も離れていない。どうすれば両方が成り立つだろう？`),
      },
      {
        id: 'hunfxl', guest: 'robert', needs: ['skill:memory'],
        question: T(`How should I start?`, `何から始めればいい？`),
        text: T(`His name comes up in one of the Game Room scenes.`, `ゲームルームのある場面で、彼の名前が出てくる。`),
      },
      {
        id: 'hrunwm', guest: 'robert', needs: ['hint:hunfxl'],
        question: T(`How do I figure out his wish?`, `ロバート・ハンセンの願いはどうやって分かる？`),
        text: T(`Check the Game Room at 4pm.`, `16時のゲームルームを見てみよう。`),
      },
      {
        id: 'h18yj6', guest: 'robert', needs: ['hint:hrunwm', 'game@16'],
        question: T(`How do I figure out his room number? (Part 1)`, `ロバート・ハンセンの部屋番号はどうやって分かる？ #1`),
        text: T(`Which of the seven sins fits how he acted? Someone predicted where that sin would die.`, `彼の振る舞いに当てはまる大罪はどれだろう？ その罪人がどこで死ぬか、預言した人がいる。`),
      },
      {
        id: 'hfe85w', guest: 'robert', needs: ['hint:h18yj6'],
        question: T(`How do I figure out his room number? (Part 2)`, `ロバート・ハンセンの部屋番号はどうやって分かる？ #2`),
        text: T(`Check the Common Room at 3pm, then visit that room at 5pm.`, `15時の談話室を見てから、その部屋を17時に訪ねてみよう。`),
      },
      {
        id: 'hokct3', guest: 'cody',
        question: T(`How should I start?`, `何から始めればいい？`),
        text: T(`Look at his surname. Does it remind you of anything?`, `彼の名字をよく見てみよう。何か思い当たることはないだろうか？`),
      },
      {
        id: 'hku8cn', guest: 'cody', needs: ['hint:hokct3'],
        question: T(`How do I figure out his wish?`, `コーディ・ヒルベルトの願いはどうやって分かる？`),
        text: T(`Ask the receptionist about the boss. Then look at when Cody checked in.`, `フロント係に、上司のことを聞いてみよう。それから、コーディがいつチェックインしたかを見てみよう。`),
      },
      {
        id: 'h2c678', guest: 'cody', needs: ['hint:hku8cn'],
        question: T(`How do I figure out his room number? (Part 1)`, `コーディ・ヒルベルトの部屋番号はどうやって分かる？ #1`),
        text: T(`Where does the boss live?`, `上司はどこに住んでいるだろう？`),
      },
      {
        id: 'huatrj', guest: 'cody', needs: ['hint:h2c678', 'paper:secrets'],
        question: T(`How do I figure out his room number? (Part 2)`, `コーディ・ヒルベルトの部屋番号はどうやって分かる？ #2`),
        text: T(`The Secrets of the Hotel paper tells you which room is on that floor.`, `「ホテルの秘密」を見れば、その階にある部屋が分かる。`),
      },
      {
        id: 'hsul4k', guest: 'levin', needs: ['skill:memory'],
        question: T(`How should I start?`, `何から始めればいい？`),
        text: T(`He checked in at 1pm. Check the Lobby at that hour.`, `彼は13時台にチェックインした。その時刻のロビーを見てみよう。`),
      },
      {
        id: 'hc6bx1', guest: 'levin', needs: ['hint:hsul4k', 'lobby@13'],
        question: T(`How do I figure out his wish?`, `竹内勇の願いはどうやって分かる？`),
        text: T(`What does the man in the Lobby ask for? Use the check-in times and process of elimination.`, `ロビーにいる男性は、何を頼んでいる？ チェックイン時刻と消去法を使おう。`),
      },
      {
        id: 'h6l63h', guest: 'levin', needs: ['hint:hc6bx1', 'paper:secrets'],
        question: T(`How do I figure out his room number?`, `竹内勇の部屋番号はどうやって分かる？`),
        text: T(`Which floor did his elevator go to? The Secrets of the Hotel paper tells you which room is on that floor.`, `彼のエレベーターは何階に行った？ 「ホテルの秘密」を見れば、その階にある部屋が分かる。`),
      },
      {
        id: 'h82ow3', guest: 'caleb',
        question: T(`How should I start?`, `何から始めればいい？`),
        text: T(`Caleb is easier to work out from the wish side. Try asking about the wishes instead, and come back once you have found someone who could be him.`, `鈴木翔太は、名前から探すより、願いから辿った方が見つけやすい。先に願いのヒントを見てみよう。彼かもしれない人物が見つかったら、また戻ってこよう。`),
      },
      {
        id: 'hsl31f', guest: 'caleb', needs: ['hint:h82ow3'],
        question: T(`How do I figure out his room number?`, `鈴木翔太の部屋番号はどうやって分かる？`),
        text: T(`Once you know which wish is his, the hints for that wish will help you find the room.`, `彼の願いが分かれば、その願いのヒントから部屋番号も分かるはずだ。`),
      },
      {
        id: 'hrqj1o', guest: 'caleb', needs: ['hint:h82ow3'],
        question: T(`I've found someone who might be him. How do I make sure?`, `鈴木翔太かもしれない人物を見つけた。確かめるにはどうすればいい？`),
        text: T(`Caleb checked in at 11am. Use the check-in times and process of elimination.`, `鈴木翔太がチェックインしたのは11時台だ。チェックイン時刻と消去法を使おう。`),
      },
      {
        id: 'h6iqxg', guest: 'chuck',
        question: T(`How should I start?`, `何から始めればいい？`),
        text: T(`Chuck is easier to work out from the wish side. Try asking about the wishes instead, and come back once you have found someone who could be him.`, `受田司は、名前から探すより、願いから辿った方が見つけやすい。先に願いのヒントを見てみよう。彼かもしれない人物が見つかったら、また戻ってこよう。`),
      },
      {
        id: 'hpfurm', guest: 'chuck', needs: ['hint:h6iqxg'],
        question: T(`How do I figure out his room number?`, `受田司の部屋番号はどうやって分かる？`),
        text: T(`Once you know which wish is his, the hints for that wish will help you find the room.`, `彼の願いが分かれば、その願いのヒントから部屋番号も分かるはずだ。`),
      },
      {
        id: 'h2zmm7', guest: 'chuck', needs: ['hint:h6iqxg'],
        question: T(`I've found someone who might be him. How do I make sure?`, `受田司かもしれない人物を見つけた。確かめるにはどうすればいい？`),
        text: T(`Chuck checked in at 9pm. Use the check-in times and process of elimination.`, `受田司がチェックインしたのは21時台だ。チェックイン時刻と消去法を使おう。`),
      },
      {
        id: 'h6hglt', guest: 'philip',
        question: T(`How should I start?`, `何から始めればいい？`),
        text: T(`Philip is easier to work out from the wish side. Try asking about the wishes instead, and come back once you have found someone who could be him.`, `清水太郎は、名前から探すより、願いから辿った方が見つけやすい。先に願いのヒントを見てみよう。彼かもしれない人物が見つかったら、また戻ってこよう。`),
      },
      {
        id: 'hgn5s0', guest: 'philip', needs: ['hint:h6hglt'],
        question: T(`How do I figure out his room number?`, `清水太郎の部屋番号はどうやって分かる？`),
        text: T(`Once you know which wish is his, the hints for that wish will help you find the room.`, `彼の願いが分かれば、その願いのヒントから部屋番号も分かるはずだ。`),
      },
      {
        id: 'hii812', guest: 'philip', needs: ['hint:h6hglt'],
        question: T(`I've found someone who might be him. How do I make sure?`, `清水太郎かもしれない人物を見つけた。確かめるにはどうすればいい？`),
        text: T(`Philip checked in at 8pm, and so did one other guest. Place the other one first, and Philip is whoever is left.`, `清水太郎がチェックインしたのは20時台だ。同じ時間帯にチェックインした宿泊客がもう一人いる。先にもう一人を特定すれば、残った方が清水太郎だ。`),
      },
      {
        id: 'h4z1a5', guest: 'serena',
        question: T(`How should I start?`, `何から始めればいい？`),
        text: T(`Serena is easier to work out from the wish side. Try asking about the wishes instead, and come back once you have found someone who could be her.`, `九十九百花は、名前から探すより、願いから辿った方が見つけやすい。先に願いのヒントを見てみよう。彼女かもしれない人物が見つかったら、また戻ってこよう。`),
      },
      {
        id: 'hc6s13', guest: 'serena', needs: ['hint:h4z1a5'],
        question: T(`How do I figure out her room number?`, `九十九百花の部屋番号はどうやって分かる？`),
        text: T(`Once you know which wish is hers, the hints for that wish will help you find the room.`, `彼女の願いが分かれば、その願いのヒントから部屋番号も分かるはずだ。`),
      },
      {
        id: 'hvi22t', guest: 'serena', needs: ['hint:h4z1a5'],
        question: T(`I've found someone who might be her. How do I make sure?`, `九十九百花かもしれない人物を見つけた。確かめるにはどうすればいい？`),
        text: T(`Serena checked in at 2pm. Use the check-in times and process of elimination.`, `九十九百花がチェックインしたのは14時台だ。チェックイン時刻と消去法を使おう。`),
      },
      {
        id: 'hkx8fx', guest: 'jessica',
        question: T(`How should I start?`, `何から始めればいい？`),
        text: T(`Jessica is easier to work out from the wish side. Try asking about the wishes instead, and come back once you have found someone who could be her.`, `池田結菜は、名前から探すより、願いから辿った方が見つけやすい。先に願いのヒントを見てみよう。彼女かもしれない人物が見つかったら、また戻ってこよう。`),
      },
      {
        id: 'huq241', guest: 'jessica', needs: ['hint:hkx8fx'],
        question: T(`How do I figure out her room number?`, `池田結菜の部屋番号はどうやって分かる？`),
        text: T(`Once you know which wish is hers, the hints for that wish will help you find the room.`, `彼女の願いが分かれば、その願いのヒントから部屋番号も分かるはずだ。`),
      },
      {
        id: 'h1q26s', guest: 'jessica', needs: ['hint:hkx8fx'],
        question: T(`I've found someone who might be her. How do I make sure?`, `池田結菜かもしれない人物を見つけた。確かめるにはどうすればいい？`),
        text: T(`Jessica checked in at 3pm. Use the check-in times and process of elimination.`, `池田結菜がチェックインしたのは15時台だ。チェックイン時刻と消去法を使おう。`),
      },
      {
        id: 'hka1o5', guest: 'jones',
        question: T(`How should I start?`, `何から始めればいい？`),
        text: T(`Jones is easier to work out from the wish side. Try asking about the wishes instead, and come back once you have found someone who could be him.`, `長谷川悠人は、名前から探すより、願いから辿った方が見つけやすい。先に願いのヒントを見てみよう。彼かもしれない人物が見つかったら、また戻ってこよう。`),
      },
      {
        id: 'hqvvjr', guest: 'jones', needs: ['hint:hka1o5'],
        question: T(`How do I figure out his room number?`, `長谷川悠人の部屋番号はどうやって分かる？`),
        text: T(`Once you know which wish is his, the hints for that wish will help you find the room.`, `彼の願いが分かれば、その願いのヒントから部屋番号も分かるはずだ。`),
      },
      {
        id: 'h64p70', guest: 'jones', needs: ['hint:hka1o5'],
        question: T(`I've found someone who might be him. How do I make sure?`, `長谷川悠人かもしれない人物を見つけた。確かめるにはどうすればいい？`),
        text: T(`Jones checked in at 6pm. Use the check-in times and process of elimination.`, `長谷川悠人がチェックインしたのは18時台だ。チェックイン時刻と消去法を使おう。`),
      },
      {
        id: 'h9ip5u', guest: 'victor',
        question: T(`How should I start?`, `何から始めればいい？`),
        text: T(`Victor is easier to work out from the wish side. Try asking about the wishes instead, and come back once you have found someone who could be him.`, `富田虚は、名前から探すより、願いから辿った方が見つけやすい。先に願いのヒントを見てみよう。彼かもしれない人物が見つかったら、また戻ってこよう。`),
      },
      {
        id: 'hcywel', guest: 'victor', needs: ['hint:h9ip5u'],
        question: T(`How do I figure out his room number?`, `富田虚の部屋番号はどうやって分かる？`),
        text: T(`Once you know which wish is his, the hints for that wish will help you find the room.`, `彼の願いが分かれば、その願いのヒントから部屋番号も分かるはずだ。`),
      },
      {
        id: 'hgamme', guest: 'victor', needs: ['hint:h9ip5u'],
        question: T(`I've found someone who might be him. How do I make sure?`, `富田虚かもしれない人物を見つけた。確かめるにはどうすればいい？`),
        text: T(`Victor checked in at 7am. Use the check-in times and process of elimination.`, `富田虚がチェックインしたのは7時台だ。チェックイン時刻と消去法を使おう。`),
      },
      {
        id: 'hfv813', guest: 'polina',
        question: T(`How should I start?`, `何から始めればいい？`),
        text: T(`Polina is easier to work out from the wish side. Try asking about the wishes instead, and come back once you have found someone who could be her.`, `伊呂波初は、名前から探すより、願いから辿った方が見つけやすい。先に願いのヒントを見てみよう。彼女かもしれない人物が見つかったら、また戻ってこよう。`),
      },
      {
        id: 'hesmjz', guest: 'polina', needs: ['hint:hfv813'],
        question: T(`How do I figure out her room number?`, `伊呂波初の部屋番号はどうやって分かる？`),
        text: T(`Once you know which wish is hers, the hints for that wish will help you find the room.`, `彼女の願いが分かれば、その願いのヒントから部屋番号も分かるはずだ。`),
      },
      {
        id: 'hs9shw', guest: 'polina', needs: ['hint:hfv813'],
        question: T(`I've found someone who might be her. How do I make sure?`, `伊呂波初かもしれない人物を見つけた。確かめるにはどうすればいい？`),
        text: T(`Polina checked in at 4pm. Use the check-in times and process of elimination.`, `伊呂波初がチェックインしたのは16時台だ。チェックイン時刻と消去法を使おう。`),
      },
      {
        id: 'haa5o8', guest: 'lucy',
        question: T(`How should I start?`, `何から始めればいい？`),
        text: T(`Lucy is easier to work out from the wish side. Try asking about the wishes instead, and come back once you have found someone who could be her.`, `森田彼方は、名前から探すより、願いから辿った方が見つけやすい。先に願いのヒントを見てみよう。彼女かもしれない人物が見つかったら、また戻ってこよう。`),
      },
      {
        id: 'hp9ceu', guest: 'lucy', needs: ['hint:haa5o8'],
        question: T(`How do I figure out her room number?`, `森田彼方の部屋番号はどうやって分かる？`),
        text: T(`Once you know which wish is hers, the hints for that wish will help you find the room.`, `彼女の願いが分かれば、その願いのヒントから部屋番号も分かるはずだ。`),
      },
      {
        id: 'htpfr3', guest: 'lucy', needs: ['hint:haa5o8'],
        question: T(`I've found someone who might be her. How do I make sure?`, `森田彼方かもしれない人物を見つけた。確かめるにはどうすればいい？`),
        text: T(`Lucy checked in at 7am. Use the check-in times and process of elimination.`, `森田彼方がチェックインしたのは7時台だ。チェックイン時刻と消去法を使おう。`),
      },
      {
        id: 'hena2p', guest: 'ruby',
        question: T(`How should I start?`, `何から始めればいい？`),
        text: T(`Ruby is easier to work out from the wish side. Try asking about the wishes instead, and come back once you have found someone who could be her.`, `一二三澪は、名前から探すより、願いから辿った方が見つけやすい。先に願いのヒントを見てみよう。彼女かもしれない人物が見つかったら、また戻ってこよう。`),
      },
      {
        id: 'hk29hx', guest: 'ruby', needs: ['hint:hena2p'],
        question: T(`How do I figure out her room number?`, `一二三澪の部屋番号はどうやって分かる？`),
        text: T(`Once you know which wish is hers, the hints for that wish will help you find the room.`, `彼女の願いが分かれば、その願いのヒントから部屋番号も分かるはずだ。`),
      },
      {
        id: 'h99ngf', guest: 'ruby', needs: ['hint:hena2p'],
        question: T(`I've found someone who might be her. How do I make sure?`, `一二三澪かもしれない人物を見つけた。確かめるにはどうすればいい？`),
        text: T(`Ruby checked in at 8pm. Use the check-in times and process of elimination.`, `一二三澪がチェックインしたのは20時台だ。チェックイン時刻と消去法を使おう。`),
      },
      {
        id: 'hd13jt', guest: 'matthias',
        question: T(`How should I start?`, `何から始めればいい？`),
        text: T(`Matthias is easier to work out from the wish side. Try asking about the wishes instead, and come back once you have found someone who could be him.`, `上田天馬は、名前から探すより、願いから辿った方が見つけやすい。先に願いのヒントを見てみよう。彼かもしれない人物が見つかったら、また戻ってこよう。`),
      },
      {
        id: 'h5ci97', guest: 'matthias', needs: ['hint:hd13jt'],
        question: T(`How do I figure out his room number?`, `上田天馬の部屋番号はどうやって分かる？`),
        text: T(`Once you know which wish is his, the hints for that wish will help you find the room.`, `彼の願いが分かれば、その願いのヒントから部屋番号も分かるはずだ。`),
      },
      {
        id: 'hmsrl0', guest: 'matthias', needs: ['hint:hd13jt'],
        question: T(`I've found someone who might be him. How do I make sure?`, `上田天馬かもしれない人物を見つけた。確かめるにはどうすればいい？`),
        text: T(`Matthias checked in at 10pm. Use the check-in times and process of elimination.`, `上田天馬がチェックインしたのは22時台だ。チェックイン時刻と消去法を使おう。`),
      },
      {
        id: 'hi84y4', guest: 'nigel', needs: ['hint:hm5d8w', 'game'],
        question: T(`I need some more hints.`, `もっとヒントがほしい。`),
        text: T(`Nigel is one of the people you talked to today.`, `羽生直樹は、今日あなたが話をした人物の一人だ。`),
      },
      {
        id: 'hwfrll', wish: 'attract', needs: ['hint:hxzz4c'],
        question: T(`How do I find out their name?`, `この人物の名前はどうやって分かる？`),
        text: T(`The person is in the Dining Room at 8am, so there are only a few candidates.`, `その人物は8時にダイニングルームにいる。そのため、候補になる人物は限られる。`),
      },
      {
        id: 'hd1ali', guest: 'alice', needs: ['paper:secrets'],
        question: T(`How do I figure out her room number?`, `アリス・ミラーの部屋番号はどうやって分かる？`),
        text: T(`One line of the Secrets of the Hotel paper names a room that can send someone to another world.`, `「ホテルの秘密」の一行に、人を別の世界へ送る力を持つ部屋が書かれている。`),
      },
      {
        id: 'hd2dea', wish: 'deathday', needs: ['hint:hp2ew5', 'skill:memory'],
        question: T(`How do I figure out the owner of this wish?`, `この願いの持ち主はどうやって分かる？`),
        text: T(`Check the Dining Room at 7am. One of the diners has lived through this day before, again and again.`, `7時のダイニングルームを調べよう。客の一人は、この一日を何度も何度も繰り返している。`),
      },
      {
        id: 'hd3dea', wish: 'deathday', needs: ['hint:hd2dea', 'dining@7'],
        question: T(`How do I figure out the room number of the owner of this wish?`, `この願いの持ち主の部屋番号はどうやって分かる？`),
        text: T(`At 7am they describe both of their neighbors: a woman whose baby cries all night, and a chess player. Find those two rooms. Theirs is the one in between.`, `7時の場面で、その人物は両隣の住人について話している。一晩中赤ん坊が泣いている女性と、チェスプレイヤーだ。その二つの部屋を見つければ、間にある部屋がその人物の部屋だ。`),
      },
      {
        id: 'hd4dea', wish: 'deathday', needs: ['hint:hd3dea'],
        question: T(`How do I find out their name?`, `この人物の名前はどうやって分かる？`),
        text: T(`They have been reliving this day since they arrived in the morning. Use the Check-in List and process of elimination.`, `その人物は、朝に到着してからずっとこの一日を繰り返している。チェックイン一覧と消去法を使おう。`),
      },
      {
        id: 'hd5you', wish: 'young', needs: ['hint:hgqf73'],
        question: T(`I haven't met anyone like that. Where are they?`, `そんな人物には会っていない。どこにいる？`),
        text: T(`You won't see them, but you might hear them. Someone in the Dining Room at 7am complains about a neighbor.`, `姿は見えないが、声なら聞こえるかもしれない。7時のダイニングルームで、隣人について文句を言っている人がいる。`),
      },
      {
        id: 'hd6att', wish: 'attract', needs: ['hint:hwfrll'],
        question: T(`How do I figure out the room number of the owner of this wish?`, `この願いの持ち主の部屋番号はどうやって分かる？`),
        text: T(`They tell the woman they met where their room is in the Dining Room at 12pm.`, `12時のダイニングルームで、出会った女性に自分の部屋の場所を話している。`),
      },
      {
        id: 'hd7two', wish: 'two', needs: ['hint:hcah2z', 'skill:memory'],
        question: T(`How do I figure out the owner of this wish? (Part 2)`, `この願いの持ち主はどうやって分かる？ #2`),
        text: T(`Someone was shot in Room 2049 around 6pm yesterday. Who heard the shot from their room next door, and where else were they at that moment?`, `昨日の18時ごろ、2049号室で誰かが撃たれた。隣の部屋で銃声を聞いたのは誰か。そして、その人物はその時刻に他のどこにいたか。`),
      },
      {
        id: 'hd8two', wish: 'two', needs: ['hint:hd7two'],
        question: T(`How do I figure out the room number of the owner of this wish?`, `この願いの持ち主の部屋番号はどうやって分かる？`),
        text: T(`It is next door to Room 2049. Of the two rooms beside it, which one does someone still seem to be staying in?`, `2049号室の隣だ。両隣の二部屋のうち、まだ誰かが泊まっていそうなのはどちらだろう？`),
      },
      {
        id: 'hd9che', wish: 'chess', needs: ['hint:hw8i9t'],
        question: T(`How do I figure out the room number of the owner of this wish?`, `この願いの持ち主の部屋番号はどうやって分かる？`),
        text: T(`Which of the seven sins fits how they behaved in the Game Room? Someone in the Common Room at 3pm predicted where that sin would die. Visit that room at 5pm.`, `ゲームルームでの振る舞いは、七つの大罪のどれに当てはまるだろう？ 15時の談話室で、その罪人がどこで死ぬかを預言した人がいる。その部屋を17時に訪ねよう。`),
      },
      {
        id: 'hdastr', wish: 'streamer', needs: ['hint:hduea5', 'paper:secrets'],
        question: T(`How do I figure out the room number of the owner of this wish?`, `この願いの持ち主の部屋番号はどうやって分かる？`),
        text: T(`The streamer vanished in the middle of a stream. One line of the Secrets of the Hotel paper says where someone suddenly disappeared.`, `配信者は配信の途中で消えた。「ホテルの秘密」の一行に、誰かが突然消えた場所が書かれている。`),
      },
      {
        id: 'hdbfly', wish: 'fly', needs: ['hint:herpae'],
        question: T(`How do I figure out the room number of the owner of this wish?`, `この願いの持ち主の部屋番号はどうやって分かる？`),
        text: T(`The bird left its things behind in its room. The receptionist suggested a few rooms to visit. Look for a room with feathers in it but no guest.`, `鳥は自分の荷物を部屋に残していった。フロント係が訪ねるべき部屋をいくつか教えてくれたはずだ。羽が落ちているのに本人のいない部屋を探そう。`),
      },
      {
        id: 'hdcinv', wish: 'invisible', needs: ['hint:hb90w1'],
        question: T(`How do I find out their name?`, `この人物の名前はどうやって分かる？`),
        text: T(`This one is best left until most other guests are placed. Then use the Check-in List and process of elimination.`, `これは、他の宿泊客をほとんど特定してから考えるのがいい。その後、チェックイン一覧と消去法を使おう。`),
      },
      {
        id: 'hdfame', wish: 'famous', needs: ['hint:hqhpyd'],
        question: T(`How do I find out their name?`, `この人物の名前はどうやって分かる？`),
        text: T(`Not by the name they use now: that is the famous person's. Use the Check-in List and process of elimination.`, `今名乗っている名前ではない。それは有名人の名前だ。チェックイン一覧と消去法を使おう。`),
      },
    ],
    // @hints-end

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
        // room is huge enough to write as 0. (Elevators only run in the present.)
        const left = T(`The left elevator is in use. The indicator above it is lit, its number already too long for the display.`,
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

We hear you enjoy a good mystery, so we have prepared one for you. Since yesterday, a number of guests have checked into this hotel. Can you work out each guest's name, wish and room number?

Write your answers in the **Register**: one row per guest, filled in any order. A room numbered above 999,999,999 may simply be written as 0.

The register checks your answers three at a time: whenever three rows are correct, it confirms them together.

Should anything you read catch your eye, select the text to copy it into your notes.`,
          `ヒルベルト・ホテルへようこそ。当ホテルでは、どんな願いも叶えてさしあげます。

謎解きがお好きだと伺いましたので、一つご用意いたしました。昨日から、このホテルには何人ものお客様がチェックインされています。それぞれのお客様の名前、願い、部屋番号を突き止められるでしょうか？

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
        text: s => T(guestList('en', s), guestList('ja', s)),
      },
      { id: 'wishes', title: T('List of Wishes', '願いの一覧') },
      {
        id: 'checkin',
        title: T('Check-in List', 'チェックイン一覧'),
        text: () => T(
          `Yesterday's check-ins at the front desk, by hour. Times are not exact: a guest listed at 11:00 checked in at some point between 11:00 and 11:59.\n\n${checkIns('en')}`,
          `昨日チェックインされたお客様の一覧です。時刻は正確ではありません。たとえば「11時台」のお客様は、11時00分から11時59分の間にチェックインされています。\n\n${checkIns('ja')}`),
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

- Someone suddenly disappeared in Room 1214 earlier today, at the very moment another guest's wish came true.

- Your room number decides whether you live to see the end of the day.
`,
          `- このホテルの他の階にも部屋がある。7号室は2階、77号室は3階、777号室は4階にある。

- 誰かが真夜中からずっと7階にいる。

- 444号室では今日、死が何度も繰り返されている。

- 666号室には、人を異世界に転移させる力がある。

- 今日、別の客の願いが叶った瞬間に、1214号室で誰かが忽然と姿を消した。

- 部屋番号によって、その日の終わりまで生きられるかどうかが決まる。
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
          `In any room, choose an hour of yesterday (07–23) from the row above the room number field to see what happened there during that hour. It won't necessarily show you everything that happened. Hours with nothing to see are dimmed. **Back to the present** returns you to the room as it is now.`,
          `どの部屋でも、部屋番号の欄の上に並ぶ昨日の時刻（7〜23時）を選ぶと、その一時間にそこで起きたことが見られる。ただし、すべてが映るとは限らない。見るものがない時刻は薄く表示される。**現在に戻る** を押すと、今の部屋に戻る。`),
      },
    },

    wishes,
    characters,
    rooms,
    emptyRoom,
    dialogues,
  });
})();
