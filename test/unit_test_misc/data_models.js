module.exports.transcript_count = {
  "model" : "transcript_count",
  "storageType" : "SQL",
  "attributes" : {
    "gene" : "String",
    "variable" : "String",
    "count" : "Float",
    "tissue_or_condition": "String",
    "individual_id": "Int"
  },
  "associations":{
    "individual":{
      "type" : "many_to_one",
      "implementation": "foreignkey",
      "target" : "individual",
      "targetKey" : "individual_id",
      "keysIn": "transcript_count",
      "targetStorageType" : "sql"
    }
  }
}

module.exports.individual = {
  "model" : "individual",
  "storageType" : "SQL",
  "attributes" : {
    "name" : "String"
  },
  "associations": {
    "transcript_counts": {
      "type" : "one_to_many",
      "implementation": "foreignkey",
      "target" : "transcript_count",
      "keysIn": "transcript_count",
      "targetKey" : "individual_id",
      "targetStorageType" : "sql"
    }
  }
}

module.exports.individual_no_assoc = {
  "model" : "individual",
  "storageType" : "SQL",
  "attributes" : {
    "name" : "String"
  }
}

module.exports.transcript_count_no_assoc =  {
  "model" : "transcript_count",
  "storageType" : "SQL",
  "attributes" : {
    "gene" : "String",
    "variable" : "String",
    "count" : "Float",
    "tissue_or_condition": "String"
  }
}

module.exports.person = {
  "model" : "Person",
  "storageType" : "SQL",
  "attributes" : {
    "firstName" : "String",
    "lastName" : "String",
    "email" : "String"
  },
  "associations":{
    "dogs":{
      "type" : "one_to_many",
      "implementation": "foreignkey",
      "target" : "Dog",
      "targetKey" : "personId",
      "keysIn": "Dog",
      "targetStorageType" : "sql"
    },

    "books":{
      "type" : "many_to_many",
      "implementation": "sql_cross_table",
      "target" : "Book",
      "targetKey" : "bookId",
      "sourceKey" : "personId",
      "keysIn" : "books_to_people",
      "targetStorageType" : "sql"
    }
  }
}

module.exports.book = {
  "model" : "Book",
  "storageType" : "sql",
  "attributes" : {
    "title" : "String",
    "genre" : "String",
    "publisherId": "Int"
  },
  "associations":{

      "people" : {
          "type" : "many_to_many",
          "implementation": "sql_cross_table",
          "target" : "Person",
          "targetKey" : "personId",
          "sourceKey" : "bookId",
          "keysIn" : "books_to_people",
          "targetStorageType" : "sql"
        },
      "publisher" : {
        "type" : "many_to_one",
        "implementation": "foreignkey",
        "target" : "Publisher",
        "targetKey" : "publisherId",
        "keysIn": "Book",
        "targetStorageType" : "generic"
        }
  }
}

module.exports.researcher = {
  "model" : "Researcher",
  "storageType" : "SQL",
  "attributes" : {
    "firstName" : "String",
    "lastName" : "String",
    "email" : "String"
  },
  "associations":{
    "projects":{
      "type" : "many_to_many",
      "implementation": "sql_cross_table",
      "target" : "Project",
      "targetKey" : "projectId",
      "sourceKey" : "researcherId",
      "keysIn" : "project_to_researcher",
      "targetStorageType" : "sql"
    },
    "dog":{
      "type": "many_to_one",
      "implementation": "foreignkey",
      "target": "Dog",
      "targetKey": "researcherId",
      "keysIn": "Dog",
      "targetStorageType": "sql"
    }
  }
}

module.exports.specie = {
  "model" : "Specie",
  "storageType" : "generic",
  "attributes" : {
    "nombre" : "String",
    "e_nombre_comun_principal" : "String",
    "e_foto_principal" : "String",
    "nombre_cientifico" : "String"
  },

  "associations":{
    "projects" : {
      "type" : "one_to_many",
      "implementation": "foreignkey",
      "target" : "Project",
      "targetKey" : "specieId",
      "keysIn": "Project",
      "targetStorageType" : "sql"
    }
  }
}

module.exports.dog = {
  "model" : "Dog",
  "storageType" : "Sql",
  "attributes" : {
    "name" : "String",
    "breed" : "String"
  },

  "associations" : {
    "person" : {
      "type" : "many_to_one",
      "implementation": "foreignkey",
      "target" : "Person",
      "targetKey" : "personId",
      "keysIn": "Dog",
      "targetStorageType" : "sql",
      "label": "firstName",
      "sublabel": "lastName"
    },
    "researcher":{
      "type" : "many_to_one",
      "implementation": "foreignkey",
      "target": "Researcher",
      "targetKey": "researcherId",
      "keysIn": "Dog",
      "targetStorageType": "SQL",
      "label": "firstName"
    }
  }
}

module.exports.assoc_through_project_researcher = {
  "type" : "many_to_many",
  "implementation": "sql_cross_table",
  "target" : "Project",
  "targetKey" : "projectId",
  "sourceKey" : "researcherId",
  "keysIn" : "project_to_researcher",
  "targetStorageType" : "sql",
  "source": "researchers",
  "target_lc": "project",
  "target_lc_pl": "projects",
  "target_pl": "Projects",
  "target_cp": "Project",
  "target_cp_pl": "Projects"
}

module.exports.assoc_dogs_researcher = {
  "type" : "many_to_one",
  "implementation": "foreignkey",
  "target": "Researcher",
  "targetKey": "researcherId",
  "keysIn": "Dog",
  "targetStorageType": "SQL",
  "target_lc": "researcher",
  "target_lc_pl": "researchers",
  "target_pl": "Researchers",
  "target_cp": "Researcher",
  "target_cp_pl": "Researchers",
  "source": "dogs",
  "cross": false
}

module.exports.aminoAcidSequence = {
  "model": "aminoAcidSequence",
  "storageType": "generic",
  "attributes": {
    "accession": "String",
    "sequence": "String"
  }
}

//upper an lower case models name
module.exports.inDiVIdual_camelcase = {
  "model" : "inDiVIdual",
  "storageType" : "SQL",
  "attributes" : {
    "name" : "String"
  },
  "associations": {
    "transcriptCounts": {
      "type" : "one_to_many",
      "implementation": "foreignkey",
      "target" : "transcriptCount",
      "targetKey" : "individual_id",
      "keysIn": "transcriptCount",
      "targetStorageType" : "sql",
      "label" : "gene",
      "sublabel" : "variable"
    }
  }
}

module.exports.transcriptCount_camelcase = {
  "model" : "transcriptCount",
  "storageType" : "SQL",
  "attributes" : {
    "gene" : "String",
    "variable" : "String",
    "count" : "Float",
    "tissue_or_condition": "String",
    "individual_id": "Int"
  },
  "associations":{
    "inDiVIdual":{
      "type" : "many_to_one",
      "implementation": "foreignkey",
      "target" : "inDiVIdual",
      "targetKey" : "individual_id",
      "keysIn": "transcriptCount",
      "targetStorageType" : "sql",
      "label" : "name"
    }
  }
}

module.exports.transcriptCount_indiv= {
  "model" : "transcriptCount",
  "storageType" : "SQL",
  "attributes" : {
    "gene" : "String",
    "variable" : "String",
    "count" : "Float",
    "tissue_or_condition": "String"
  },
  "associations":{
    "individual":{
      "type" : "many_to_one",
      "implementation": "foreignkey",
      "target" : "Individual",
      "targetKey" : "individual_id",
      "keysIn": "transcriptCount",
      "targetStorageType" : "sql",
      "label" : "name"
    }
  }
}

module.exports.dog_owner = {
  "model" : "Dog",
  "storageType" : "Sql",
  "attributes" : {
    "name" : "String",
    "breed" : "String",
    "owner_id_test": "Int",
    "keeperId": "Int"
  },

  "associations" : {
    "owner" : {
      "type" : "many_to_one",
      "implementation": "foreignkey",
      "target" : "Person",
      "targetKey" : "owner_id_test",
      "keysIn": "Dog",
      "targetStorageType" : "sql",
      "label": "firstName",
      "sublabel": "lastName"
    },
    "keeper":{
      "type" : "many_to_one",
      "implementation": "foreignkey",
      "target": "Researcher",
      "targetKey": "keeperId",
      "keysIn": "Dog",
      "targetStorageType": "SQL",
      "label": "firstName"
    }
  }
}

module.exports.person_indices = {
  "model" : "Person",
  "storageType" : "SQL",
  "attributes" : {
    "firstName" : "String",
    "lastName" : "String",
    "email" : "String",
    "phone" : "String"
  },
  "associations":{
    "dogs":{
      "type" : "one_to_many",
      "implementation": "foreignkey",
      "target" : "Dog",
      "targetKey" : "personId",
      "keysIn": "Dog",
      "targetStorageType" : "sql",
      "label": "name"
    },

    "books":{
      "type" : "many_to_many",
      "implementation": "sql_cross_table",
      "target" : "Book",
      "targetKey" : "bookId",
      "sourceKey" : "personId",
      "keysIn" : "books_to_people",
      "targetStorageType" : "sql",
      "label" : "title"
    }
  },

  "indices": ["email", "phone"]
}

module.exports.person_externalIds = {
    "model" : "Person",
    "storageType" : "SQL",
    "attributes" : {
      "firstName" : "String",
      "lastName" : "String",
      "email" : "String",
      "phone" : "String"
    },
    "associations":{
      "dogs":{
        "type" : "one_to_many",
        "implementation": "foreignkey",
        "target" : "Dog",
        "targetKey" : "personId",
        "keysIn": "Dog",
        "targetStorageType" : "sql",
        "label": "name"
      },

      "books":{
        "type" : "many_to_many",
        "implementation": "sql_cross_table", 
        "target" : "Book",
        "targetKey" : "bookId",
        "sourceKey" : "personId",
        "keysIn" : "books_to_people",
        "targetStorageType" : "sql",
        "label" : "title"
      }
    },

    "externalIds": ["email", "phone"]

}

module.exports.academicTeam = {
  "model" : "academicTeam",
  "storageType" : "SQL",
  "attributes" : {
    "name" : "String",
    "department" : "String",
    "subject": "String"
  },
  "associations":{
    "members":{
      "type" : "one_to_many",
      "implementation": "foreignkey",
      "target" : "Researcher",
      "targetKey" : "academicTeamId",
      "keysIn": "Researcher",
      "targetStorageType" : "sql",
      "label": "firstName",
      "sublabel": "lastName"
    }
  }

}

module.exports.person_date = {
  "model" : "Person",
  "storageType" : "SQL",
  "attributes" : {
    "firstName" : "String",
    "lastName" : "String",
    "email" : "String",
    "birthday": "Date"
  },
  "associations":{
    "dogs":{
      "type" : "one_to_many",
      "implementation": "foreignkey",
      "target" : "Dog",
      "targetKey" : "personId",
      "keysIn": "Dog",
      "targetStorageType" : "sql",
      "label": "name"
    },

    "patients":{
      "type" : "one_to_many",
      "implementation": "foreignkey",
      "target" : "Dog",
      "targetKey" : "doctor_Id",
      "keysIn": "Dog",
      "targetStorageType" : "sql",
      "label": "name"
    },

    "books":{
      "type" : "many_to_many",
      "implementation": "sql_cross_table",
      "target" : "Book",
      "targetKey" : "book_Id",
      "sourceKey" : "person_Id",
      "keysIn" : "books_to_people",
      "targetStorageType" : "sql",
      "label" : "title"
    }

  }
}

module.exports.book_authors = {
  "model" : "Book",
  "storageType" : "sql",
  "attributes" : {
    "title" : "String",
    "genre" : "String",
    "publisherId": "Int"
  },
  "associations":{

      "Authors" : {
          "type" : "many_to_many",
          "implementation": "sql_cross_table",
          "target" : "Person",
          "targetKey" : "person_Id",
          "sourceKey" : "book_Id",
          "keysIn" : "books_to_people",
          "targetStorageType" : "sql",
          "label" : "firstName",
          "sublabel" : "email"
        },
      "publisher" : {
        "type" : "many_to_one",
        "implementation": "foreignkey",
        "target" : "Publisher",
        "targetKey" : "publisherId",
        "keysIn" : "Book",
        "targetStorageType" : "generic",
        "label" : "name"
        }
  }
}

module.exports.person_description = {
  "model" : "Person",
  "storageType" : "SQL",
  "attributes" : {
    "firstName" : {
        "type": "String",
        "description": "Indicates the given name for the person"
    },
    "lastName" : {
        "type": "String",
        "description": "Indicates the family name for the person"
    },
    "email" : "String"
  },
  "associations":{
    "dogs":{
      "type" : "one_to_many",
      "implementation": "foreignkey",
      "target" : "Dog",
      "targetKey" : "personId",
      "keysIn": "Dog",
      "targetStorageType" : "sql"
    },

    "books":{
      "type" : "many_to_many",
      "implementation": "sql_cross_table",
      "target" : "Book",
      "targetKey" : "bookId",
      "sourceKey" : "personId",
      "keysIn" : "books_to_people",
      "targetStorageType" : "sql"
    }
  }
}

module.exports.person_description_optional = {
  "model" : "Person",
  "storageType" : "SQL",
  "attributes" : {
    "firstName" : {
        "type": "String"
    },
    "lastName" : {
        "type": "String",
        "description": "Indicates the family name for the person"
    },
    "email" : "String"
  },
  "associations":{
    "dogs":{
      "type" : "one_to_many",
      "implementation": "foreignkey",
      "target" : "Dog",
      "targetKey" : "personId",
      "keysIn": "Dog",
      "targetStorageType" : "sql"
    },

    "books":{
      "type" : "many_to_many",
      "implementation": "sql_cross_table",
      "target" : "Book",
      "targetKey" : "bookId",
      "sourceKey" : "personId",
      "keysIn" : "books_to_people",
      "targetStorageType" : "sql"
    }
  }
}

module.exports.academic_Team = {
  "model" : "academic_Team",
  "storageType" : "SQL",
  "attributes" : {
    "name" : "String",
    "department" : "String",
    "subject": "String",
    "meetings_time": "Time"
  },
  "associations":{
    "members":{
      "type" : "one_to_many",
      "implementation": "foreignkey",
      "target" : "Researcher",
      "targetKey" : "AcademicTeam_Id",
      "keysIn": "Researcher",
      "targetStorageType" : "sql"
    }
  }

}

module.exports.dog_one_assoc = {
  "model" : "Dog",
  "storageType" : "sql",
  "attributes" : {
    "name" : "String",
    "breed" : "String",
    "personId": "Int"
  },

  "associations" : {
    "owner" : {
      "type" : "many_to_one",
      "implementation": "foreignkey",
      "target" : "Person",
      "targetKey" : "personId",
      "keysIn" : "Dog",
      "targetStorageType" : "sql"
    }
  }
}

module.exports.person_one_assoc = {
  "model": "Person",
  "storageType": "sql",
  "attributes" :{
    "firstName": "String",
    "lastName": "String",
    "email" : "String",
    "companyId": "Int"
  },

  "associations" : {
    "unique_pet" :{
      "type": "many_to_one",
      "implementation": "foreignkey",
      "target": "Dog",
      "targetKey": "personId",
      "keysIn": "Dog",
      "targetStorageType": "sql"
    }
  }

}

module.exports.book_extendedIds = {
  "model": "Book",
  "storageType": "sql",
  "attributes": {
      "title": "String",
      "genre": "String",
      "internalPersonId": "String",
      "internalBookId": "String"
  },
  "associations": {
      "author": {
          "type": "many_to_one",
          "implementation": "foreignkey",
          "target": "Person",
          "targetKey": "internalPersonId",
          "keysIn": "Book",
          "targetStorageType": "sql",
          "label": "email"
      }
  },
  "internalId": "internalBookId"
}

module.exports.author_foreignKeyArray = {
    "model" : "author",
    "storageType" : "sql",
    "database": "default-sql",
    "attributes" : {
        "id": "String",
        "name": "String",
        "lastname": "String",
        "email": "String",
        "book_ids": "[ String ]"
    },

    "associations":{
      "books":{
        "type": "many_to_many",
        "implementation": "foreignkey",
        "target": "book",
        "targetKey": "author_ids",
        "sourceKey": "book_ids",
        "keysIn": "author",
        "targetStorageType": "sql"
      }
    },

    "internalId": "id"
  }

module.exports.author_zendro_remote = {
    "model" : "post_author",
    "storageType" : "zendro-server",
    "url": "http://server1-graphql-container:3000/graphql",
    "attributes" : {
        "id": "String",
        "name": "String",
        "lastname": "String",
        "email": "String",
        "book_ids": "[ String ]"
    },

    "associations":{
      "books":{
        "type": "many_to_many",
        "implementation": "foreignkey",
        "target": "post_book",
        "targetKey": "author_ids",
        "sourceKey": "book_ids",
        "keysIn": "post_author",
        "targetStorageType": "zendro-server"
      }
    },
    "internalId": "id"
  }

module.exports.author_ddm_array_fk ={
    "model" : "sq_author",
    "storageType" : "distributed-data-model",
    "registry": ["author_remote","author_local"],
    "attributes" : {
        "id": "String",
        "name": "String",
        "lastname": "String",
        "email": "String",
        "book_ids": "[ String ]"
    },

    "associations":{
      "books":{
        "type": "many_to_many",
        "implementation": "foreignkey",
        "target": "sq_book",
        "targetKey": "author_ids",
        "sourceKey": "book_ids",
        "keysIn": "sq_author",
        "targetStorageType": "distributed-data-model"
      }
    },
    "internalId": "id"
  }

module.exports.author_sql_adapter_array_fk ={
    "model" : "sq_author",
    "storageType" : "sql-adapter",
    "adapterName": "author_local",
    "regex": "local",
    "attributes" : {
        "id": "String",
        "name": "String",
        "lastname": "String",
        "email": "String",
        "book_ids": "[ String ]"
    },

    "associations":{
      "books":{
        "type": "many_to_many",
        "implementation": "foreignkey",
        "target": "sq_book",
        "targetKey": "author_ids",
        "sourceKey": "book_ids",
        "keysIn": "sq_author",
        "targetStorageType": "distributed-data-model"
      }
    },
    "internalId": "id"
  }


module.exports.author_zendro_adapter_array_fk ={
    "model" : "sq_author",
    "storageType" : "zendro-webservice-adapter",
    "adapterName": "author_remote",
    "regex": "remote",
    "url": "http://server1-graphql-container:3000/graphql",
    "attributes" : {
        "id": "String",
        "name": "String",
        "lastname": "String",
        "email": "String",
        "book_ids": "[ String ]"
    },

    "associations":{
      "books":{
        "type": "many_to_many",
        "implementation": "foreignkey",
        "target": "sq_book",
        "targetKey": "author_ids",
        "sourceKey": "book_ids",
        "keysIn": "sq_author",
        "targetStorageType": "distributed-data-model"
      }
    },
    "internalId": "id"
  }

module.exports.arr = {
  "model": "Arr",
  "storageType": "sql",
  "attributes" : {
    "arrId": "String",
    "country": "String",
    "arrStr": "[String]",
    "arrInt": "[Int]",
    "arrFloat": "[Float]",
    "arrBool": "[Boolean]",
    "arrDate": "[Date]",
    "arrTime": "[Time]",
    "arrDateTime": "[DateTime]"
  },

  "internalId" : "arrId"

}
