package stucanii.backend.api.events;

import java.time.Instant;

public record PanicWsEvent(
        Integer alertId,
        String clientUsername,
        boolean triggeredByLongPress,
        Instant createdAt
) {}
