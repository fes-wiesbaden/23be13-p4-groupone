package com.gradesave.backend.services;

import java.util.Optional;
import java.util.List;

public interface CrudService<T, ID> {
    T create(T entity);
    Optional<T> getById(ID id);
    List<T> getAll();
    T update(ID id, T entity);
    void deleteById(ID id);
    boolean exists(ID id);
    long count();
}
