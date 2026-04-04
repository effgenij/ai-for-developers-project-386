import "@typespec/http";
import "@typespec/rest";
using Http;
using Rest;

@service(#{
  title: "Calendar Booking API",
})
@server("http://localhost:3000", "Development server")
@doc("""
  API для системы бронирования календаря.

  Две роли:
  - **Владелец** — один заранее заданный профиль, создаёт типы событий и просматривает бронирования.
  - **Гость** — выбирает тип события, находит свободный слот и создаёт бронирование без регистрации.

  Правило занятости: на одно и то же время нельзя создать две записи, даже для разных типов событий.
  """)
namespace CalendarBooking;

// ─── Models ────────────────────────────────────────────────────

@doc("Тип события, которое можно забронировать")
model EventType {
  @doc("Уникальный идентификатор")
  id: string;

  @doc("Название типа события")
  @minLength(1)
  @maxLength(200)
  name: string;

  @doc("Описание типа события")
  @maxLength(1000)
  description: string;

  @doc("Длительность в минутах")
  @minValue(5)
  @maxValue(480)
  durationMinutes: int32;
}

@doc("Данные для создания типа события")
model EventTypeCreate {
  @minLength(1)
  @maxLength(200)
  name: string;

  @maxLength(1000)
  description: string;

  @minValue(5)
  @maxValue(480)
  durationMinutes: int32;
}

@doc("Данные для обновления типа события (все поля опциональны)")
model EventTypeUpdate {
  @minLength(1)
  @maxLength(200)
  name?: string;

  @maxLength(1000)
  description?: string;

  @minValue(5)
  @maxValue(480)
  durationMinutes?: int32;
}

@doc("Информация о госте, оставляемая при бронировании")
model GuestInfo {
  @doc("Имя гостя")
  @minLength(1)
  @maxLength(100)
  name: string;

  @doc("Email гостя")
  @minLength(5)
  @maxLength(254)
  email: string;
}

@doc("Бронирование слота")
model Booking {
  @doc("Уникальный идентификатор бронирования")
  id: string;

  @doc("ID типа события")
  eventTypeId: string;

  @doc("Название типа события (денормализовано для удобства)")
  eventTypeName: string;

  @doc("Начало бронирования (ISO 8601)")
  startTime: utcDateTime;

  @doc("Конец бронирования (ISO 8601)")
  endTime: utcDateTime;

  @doc("Информация о госте")
  guest: GuestInfo;
}

@doc("Данные для создания бронирования")
model BookingCreate {
  @doc("ID типа события")
  eventTypeId: string;

  @doc("Начало бронирования (ISO 8601)")
  startTime: utcDateTime;

  @doc("Информация о госте")
  guest: GuestInfo;
}

@doc("Свободный слот для бронирования")
model AvailableSlot {
  @doc("Начало слота (ISO 8601)")
  startTime: utcDateTime;

  @doc("Конец слота (ISO 8601)")
  endTime: utcDateTime;
}

@doc("Стандартная ошибка API")
model ApiError {
  @doc("Код ошибки")
  code: string;

  @doc("Описание ошибки")
  message: string;
}

// ─── Event Types ───────────────────────────────────────────────

@route("/api/event-types")
@tag("Event Types")
namespace EventTypes {
  @doc("Получить список всех типов событий (доступно гостям и владельцу)")
  @get
  op list(): {
    @statusCode statusCode: 200;
    @body eventTypes: EventType[];
  };

  @doc("Создать новый тип события (только владелец)")
  @post
  op create(@body body: EventTypeCreate): {
    @statusCode statusCode: 201;
    @body eventType: EventType;
  } | {
    @statusCode statusCode: 400;
    @body error: ApiError;
  };

  @doc("Получить тип события по ID")
  @get
  op read(@path id: string): {
    @statusCode statusCode: 200;
    @body eventType: EventType;
  } | {
    @statusCode statusCode: 404;
    @body error: ApiError;
  };

  @doc("Обновить тип события (только владелец)")
  @patch
  op update(@path id: string, @body body: EventTypeUpdate): {
    @statusCode statusCode: 200;
    @body eventType: EventType;
  } | {
    @statusCode statusCode: 404;
    @body error: ApiError;
  } | {
    @statusCode statusCode: 400;
    @body error: ApiError;
  };

  @doc("Удалить тип события (только владелец)")
  @delete
  op delete(@path id: string): {
    @statusCode statusCode: 204;
  } | {
    @statusCode statusCode: 404;
    @body error: ApiError;
  };

  @doc("Получить свободные слоты для типа события на указанную дату")
  @route("{id}/available-slots")
  @get
  op availableSlots(
    @path id: string,
    @doc("Дата в формате YYYY-MM-DD")
    @query date: plainDate,
  ): {
    @statusCode statusCode: 200;
    @body slots: AvailableSlot[];
  } | {
    @statusCode statusCode: 404;
    @body error: ApiError;
  };
}

// ─── Bookings ──────────────────────────────────────────────────

@route("/api/bookings")
@tag("Bookings")
namespace Bookings {
  @doc("Получить список предстоящих бронирований (только владелец)")
  @get
  op list(): {
    @statusCode statusCode: 200;
    @body bookings: Booking[];
  };

  @doc("Создать бронирование на свободный слот (гость)")
  @post
  op create(@body body: BookingCreate): {
    @statusCode statusCode: 201;
    @body booking: Booking;
  } | {
    @doc("Невалидные данные")
    @statusCode statusCode: 400;
    @body error: ApiError;
  } | {
    @doc("Тип события не найден")
    @statusCode statusCode: 404;
    @body error: ApiError;
  } | {
    @doc("Слот уже занят")
    @statusCode statusCode: 409;
    @body error: ApiError;
  };

  @doc("Отменить бронирование (только владелец)")
  @delete
  op cancel(@path id: string): {
    @statusCode statusCode: 204;
  } | {
    @statusCode statusCode: 404;
    @body error: ApiError;
  };
}
