package stucanii.backend.api;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import stucanii.backend.service.PsychologistClientsService;

import java.util.List;

@RestController
@RequestMapping("/api/psychologist/clients")
public class PsychologistClientsController {

    private final PsychologistClientsService service;

    public PsychologistClientsController(PsychologistClientsService service) {
        this.service = service;
    }

    public record ClientItem(Integer id, String username) {}

    public record ClientsPageResponse(
            List<ClientItem> items,
            int page,
            int size,
            long totalElements,
            int totalPages
    ) {}

    @GetMapping
    @PreAuthorize("hasRole('PSYCHOLOGIST')")
    public ClientsPageResponse list(
            Authentication auth,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        var pageable = PageRequest.of(
                page,
                size,
                Sort.by(Sort.Direction.ASC, "username")
        );

        Page<PsychologistClientsService.ClientDto> result =
                service.listMyClients(auth.getName(), search, pageable);

        List<ClientItem> items = result.getContent().stream()
                .map(c -> new ClientItem(c.id(), c.username()))
                .toList();

        return new ClientsPageResponse(
                items,
                result.getNumber(),
                result.getSize(),
                result.getTotalElements(),
                result.getTotalPages()
        );
    }
}