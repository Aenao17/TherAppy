package stucanii.backend.domain;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class UserTest {

    @Test
    void constructor_setsDefaultRoleToUser() {
        User u = new User("alice", "hash");
        assertEquals(Role.USER, u.getRole());
    }

    @Test
    void setRole_changesRole() {
        User u = new User("alice", "hash");
        u.setRole(Role.ADMIN);
        assertEquals(Role.ADMIN, u.getRole());
    }
}
