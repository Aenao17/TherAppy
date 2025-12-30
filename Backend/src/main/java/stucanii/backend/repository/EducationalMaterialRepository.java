package stucanii.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import stucanii.backend.domain.EducationalMaterial;

import java.util.List;

public interface EducationalMaterialRepository extends JpaRepository<EducationalMaterial, Integer> {

    List<EducationalMaterial> findByClient_IdOrderByUploadedAtDesc(Integer clientId);

    List<EducationalMaterial> findByPsychologist_UsernameAndClient_IdOrderByUploadedAtDesc(String psychologistUsername, Integer clientId);
}
