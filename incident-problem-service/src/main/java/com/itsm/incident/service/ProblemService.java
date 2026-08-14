package com.itsm.incident.service;

import com.itsm.incident.dto.request.KnownErrorRequest;
import com.itsm.incident.dto.request.ProblemRequest;
import com.itsm.incident.entity.KnownError;
import com.itsm.incident.entity.ProblemRecord;
import com.itsm.incident.enums.ProblemStatus;

import java.util.List;

public interface ProblemService {
    ProblemRecord createProblem(ProblemRequest request, Long createdByID);
    ProblemRecord getProblemById(Long id);
    List<ProblemRecord> getAllProblems();
    ProblemRecord updateProblem(Long id, ProblemRequest request);
    ProblemRecord updateProblemStatus(Long id, ProblemStatus status, String rootCause);

    KnownError createKnownError(KnownErrorRequest request);
    KnownError getKnownErrorById(Long id);
    List<KnownError> getKnownErrorsByProblem(Long problemID);
    List<KnownError> getAllKnownErrors();
    KnownError updateKnownError(Long id, KnownErrorRequest request);
}
