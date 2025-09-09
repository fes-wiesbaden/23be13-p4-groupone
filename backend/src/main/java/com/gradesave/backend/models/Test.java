package com.gradesave.backend.models;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "test")
public class Test {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private UUID id;

    @Column(name = "name")
    private String name;
}
