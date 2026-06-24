# Компактная выжимка курса CoreFlow Events

Скопируйте в новый чат как стартовый контекст.

## Методика (как идут занятия)

| Принцип | Суть |
|---------|------|
| Роль | Cursor = экзаминатор, вы пишете код сами |
| Порядок | Теория → вопросы → практика (не наоборот) |
| Объяснение | Аналогии + цепочки из вашего кода, не абстракции |
| Подсказки | Задача 1: мало; после ошибок — точечно |
| Сдача | «сдал главу N» / «сдал задачу N» + ответы или Network |
| Код | Готовый код только по запросу («исправь», «покажи») |

**Шпаргалка Vue (Глава 1):** data = блокнот | methods = руки | computed = калькулятор (не пишет в data) | props вниз | $emit вверх | JWT = localStorage token

**Алгоритм фичи (6 шагов):** 1) эндпоинт есть? 2) method/URL/body 3) UI 4) fetch (копировать соседа) 5) успех → state + $emit('updated') 6) ошибка → в форме, не alert

## Шкала оценки

| Балл | Смысл |
|------|-------|
| ≥7 средний + нет ответов <5 | Глава сдана |
| Задача | Чеклист критериев + работа в браузере/Network |
| Зачёт с замечаниями | Фича работает, но есть паттерн-ошибки — исправить до следующего этапа |

## Прогресс

| Этап | Статус |
|------|--------|
| Глава 1 — Vue | Сдана |
| Глава 2 — API, даты, organisateur_id, query ?type= | Сдана |
| Глава 3 — компоненты, алгоритм фичи | Сдана |
| Задача 1 — handleUpdate | Сдана (~80/100, работает; доработать return после !res.ok, updateError в catch) |
| C1 — statut_participation в GET list | Сдана |
| C2 — canRespond + кнопки | Сдана |
| C4 — respond() POST | Сдана |
| Задача 3 — фильтр type в EventView | После задачи 2 |
| Глава 7 — финальный экзамен | В конце |

**План:** [COURSE_EVENTS.md](COURSE_EVENTS.md)  
**Оригинал:** `C:\Users\vadim\.cursor\plans\курс_events_frontend_cd0d2949.plan.md`

## Ключевые API Events

| Действие | Method + URL |
|----------|--------------|
| Список | GET `/api/event/list/participation/:user_id/:role` |
| Одно событие + participation | GET `/api/event/list/:id/:user_id` |
| Создать | POST `/api/event/create/:role` |
| Update | PUT `/api/event/update/:user_id/:role` — body: id, organisateur_id, поля формы, даты через toBackendDate |
| Ответ на приглашение | POST `/api/event/participation/respond/:user_id` — body: `{ eventId, userId, status: "accepte" }` |

**Два statut:**
- `event.statut` — событие (planifie…)
- `event.statut_participation` — приглашение (en_attente, accepte, refuse)

## Важные уроки (ошибки → урок)

- handleUpdate без аргументов — данные из `this.event`, `this.editForm`, `this.user`
- organisateur_id в body, userId/role в URL update
- `$emit('updated')`, не `'update'`
- BE bug: eventRepository.update не вызывал callback без participations → PUT висел → fix закоммичен
- C1 = 3 слоя: repository JOIN + controller userId + frontend URL
- computed только return, не писать в data, не дублировать имя с data()
- canRespond: event есть, user не organisateur, statut_participation === 'en_attente'
- C4 — respond(status) по образцу handleDelete / handleUpdate:
  - POST `${API_URL}/event/participation/respond/${userId}`
  - body: `{ eventId: this.event.id, userId: this.user.id, status }`
  - успех → fetchEvent(id) → кнопки исчезнут

## Стартовая фраза для нового чата

```
Продолжаем курс Events CoreFlow. Главы 1–3 и задача 1 сданы. C1 (statut_participation) сдан. C2 (canRespond) сдан. C4 (respond) сдан. Дальше задача 3 — фильтр type в EventView. Экзаминатор, теория перед кодом, оценка по чеклисту. План: Docs/COURSE_EVENTS.md
```
