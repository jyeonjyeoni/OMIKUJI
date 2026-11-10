"""Compile the reviewed situation/action library into a static v2 database.

No network, random generation or runtime language model. v1 is immutable.
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
read = lambda path: json.loads(path.read_text(encoding='utf-8'))
base = read(ROOT / 'v1/fortunes.json')
db = read(ROOT / 'v1/fortunes.json')
db['version'] = 'v2'
sources = read(ROOT / 'content/topics-source.json')
motifs = read(ROOT / 'content/main-source.json')
grade_ids = [g['id'] for g in db['grades']]

# Each register has nine alternatives; all are gentle and never promise outcomes.
tones = [
 ['준비한 마음을 실제 행동으로 옮기기 좋은 흐름이로다.', '정성을 들인 만큼 뜻을 펼쳐 볼 여지가 있으리라.', '기쁜 마음을 구체적인 실천으로 이어 볼 때로다.', '이미 갖춘 힘을 믿고 한 걸음 내디뎌 볼 것.', '좋은 기회도 세심한 행동을 만날 때 오래 남으리라.', '반가운 흐름 속에서 감사와 분별을 함께 지킬 것.', '자신의 몫을 다하면 좋은 경험을 넓힐 수 있으리라.', '일이 잘 풀릴수록 곁의 작은 도움도 기억할 것.', '넉넉한 기운을 나누되 무리한 약속은 더하지 말 것.'],
 ['익숙한 기본을 지키는 데 든든함이 있으리라.', '크게 서두르지 않아도 차분한 수고가 남으리라.', '정한 범위를 충실히 돌보면 마음이 편안하리라.', '이미 알고 있는 좋은 방법을 꾸준히 써 볼 것.', '과하지 않은 선택이 오늘의 균형을 지켜 주리라.', '작은 약속을 지키는 태도가 믿음을 더하리라.', '평범한 과정에 정성을 보태면 만족이 남으리라.', '내게 맞는 속도를 유지하는 일이 도움이 되리라.', '기본을 놓치지 않으면 하루를 안정되게 이어가리라.'],
 ['어제와 조금 달라진 부분부터 알아볼 것.', '작은 수정이 다음 행동을 한결 쉽게 하리라.', '서툰 시도에서 배운 점을 다음에 보탤 것.', '완벽한 답보다 나아지는 방향을 살필 때로다.', '조금씩 익숙해지는 과정 자체에도 뜻이 있으리라.', '한 번에 바꾸기보다 필요한 부분부터 손볼 것.', '이해한 것이 늘어난 만큼 다음 길도 또렷해지리라.', '작은 가능성을 놓치지 말고 차분히 키워 볼 것.', '먼 결론을 재촉하지 않아도 오늘의 진전은 남으리라.'],
 ['작게 해낸 한 가지에서 만족을 찾아볼 것.', '짧고 편안한 실천이면 오늘은 충분하리라.', '생활의 작은 불편을 덜어 내는 데 기쁨이 있으리라.', '남에게 보일 성과보다 내게 남는 편안함을 볼 것.', '부담 없는 범위에서 소소한 즐거움을 마련할 것.', '가까운 곳에서 얻는 작은 보람을 귀히 여길 것.', '잠깐의 여유라도 나를 위해 남겨 둘 것.', '큰 변화를 바라지 않아도 의미 있는 하루가 되리라.', '놓치기 쉬운 좋은 순간 하나를 기억할 것.'],
 ['결론에 이르는 시간을 조금 더 넉넉히 둘 것.', '지금은 결과보다 바탕을 살피는 때로다.', '더디다는 느낌만으로 방향을 잘못 잡았다고 여기지 말 것.', '기다리는 동안 준비할 수 있는 작은 몫을 찾을 것.', '바로 달라지지 않아도 점검한 내용은 다음에 쓰이리라.', '서두르는 마음을 낮추고 필요한 조건을 갖출 것.', '한동안 보이지 않는 수고에도 자리를 내어 줄 것.', '다음 기회를 위해 지금의 상태를 차분히 기록할 것.', '시간을 두고 다시 볼 여유가 더 나은 선택을 돕게 되리라.'],
 ['한 호흡 멈추고 확인한 사실부터 살필 것.', '속도를 줄이는 선택도 오늘의 좋은 판단이 되리라.', '무리하게 만회하려 하지 말고 가능한 범위를 지킬 것.', '불안한 추측보다 지금 확인할 수 있는 내용에 마음을 둘 것.', '부담이 커지면 혼자 떠안지 말고 필요한 도움을 구할 것.', '감정이 앞설 때는 잠시 거리를 두고 다시 볼 것.', '작은 어긋남을 발견했다면 탓하기보다 바로잡을 것.', '급한 분위기 속에서도 나의 기준을 놓치지 말 것.', '오늘의 신중함을 두려움이 아닌 돌봄으로 여길 것.']
]
for topic, rows in sources.items():
    assert len(rows) == 27, topic
    for grade_index, gid in enumerate(grade_ids):
        for i, (scene, action, caution) in enumerate(rows):
            # The context/action pair is authored, not a word-substitution template.
            # Higher grades emphasize action; delayed/cautious grades emphasize boundaries.
            chosen = action if grade_index < 4 else caution
            text = f'{scene}. {chosen} {tones[grade_index][i % 9]}'
            db['topics'][topic][gid].append({'id': f'{topic}-{gid}-{i+4:03}', 'text':text})

assert len(motifs) == 32
for i, (title, scene, readings, action, caution) in enumerate(motifs):
    assert len(readings) == 6
    for grade_index, gid in enumerate(grade_ids):
        number = 49 + i * 6 + grade_index
        guidance = action if grade_index < 4 else caution
        db['main'].append({
            'id': f'{gid}-{i+9:03}', 'grade':gid, 'number':number,
            'title':title, 'poem':f'{scene} {readings[grade_index]}',
            'guidance': f'{guidance} {tones[grade_index][(i+3) % 9]}'
        })

main = db['main']
messages = [m for topic in db['topics'].values() for pool in topic.values() for m in pool]
assert len(main)==240 and len(messages)==1440
assert len({m['id'] for m in main+messages})==1680
assert len({m['number'] for m in main})==240
assert len({m['poem'] for m in main})==240
assert len({m['text'] for m in messages})==1440
assert len({m['guidance'] for m in main})==240
for g in grade_ids:
    assert sum(m['grade']==g for m in main)==40
    assert all(len(topic[g])==30 for topic in db['topics'].values())
for old in base['main']:
    assert next(m for m in main if m['id']==old['id'])==old
(ROOT/'fortunes.json').write_text(json.dumps(db,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('v2: 240 main fortunes + 1,440 topic readings = 1,680 complete entries; v1 preserved.')
