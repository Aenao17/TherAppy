package stucanii.backend.api.events;

public record PanicAckEvent(
        Integer alertId,
        boolean withVideo,
        String psychologistUsername,
        String videoRoomId,
        String jitsiToken
) {}