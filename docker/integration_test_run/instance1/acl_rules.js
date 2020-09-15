module.exports = {
    aclRules: [
        //administrator
        {
            roles: 'administrator',
            allows: [{
                resources: [
                    'role',
                    'user',
                    'role_to_user',
                ],
                permissions: '*'
            }]
        },

        //models
        /**
         * Model: Accession
         */
        {
            roles: 'editor',
            allows: [{
                resources: 'Accession',
                permissions: 'create'
            }]
        },
        {
            roles: 'reader',
            allows: [{
                resources: 'Accession',
                permissions: 'read'
            }]
        },
        {
            roles: 'editor',
            allows: [{
                resources: 'Accession',
                permissions: 'update'
            }]
        },
        {
            roles: 'editor',
            allows: [{
                resources: 'Accession',
                permissions: 'delete'
            }]
        },
        /**
         * Model: aminoacidsequence
         */
        {
            roles: 'editor',
            allows: [{
                resources: 'aminoacidsequence',
                permissions: 'create'
            }]
        },
        {
            roles: 'reader',
            allows: [{
                resources: 'aminoacidsequence',
                permissions: 'read'
            }]
        },
        {
            roles: 'editor',
            allows: [{
                resources: 'aminoacidsequence',
                permissions: 'update'
            }]
        },
        {
            roles: 'editor',
            allows: [{
                resources: 'aminoacidsequence',
                permissions: 'delete'
            }]
        },
        /**
         * Model: capital
         */
        {
            roles: 'editor',
            allows: [{
                resources: 'capital',
                permissions: 'create'
            }]
        },
        {
            roles: 'reader',
            allows: [{
                resources: 'capital',
                permissions: 'read'
            }]
        },
        {
            roles: 'editor',
            allows: [{
                resources: 'capital',
                permissions: 'update'
            }]
        },
        {
            roles: 'editor',
            allows: [{
                resources: 'capital',
                permissions: 'delete'
            }]
        },
        /**
         * Model: country
         */
        {
            roles: 'editor',
            allows: [{
                resources: 'country',
                permissions: 'create'
            }]
        },
        {
            roles: 'reader',
            allows: [{
                resources: 'country',
                permissions: 'read'
            }]
        },
        {
            roles: 'editor',
            allows: [{
                resources: 'country',
                permissions: 'update'
            }]
        },
        {
            roles: 'editor',
            allows: [{
                resources: 'country',
                permissions: 'delete'
            }]
        },
        /**
         * Model: country_to_river
         */
        {
            roles: 'editor',
            allows: [{
                resources: 'country_to_river',
                permissions: 'create'
            }]
        },
        {
            roles: 'reader',
            allows: [{
                resources: 'country_to_river',
                permissions: 'read'
            }]
        },
        {
            roles: 'editor',
            allows: [{
                resources: 'country_to_river',
                permissions: 'update'
            }]
        },
        {
            roles: 'editor',
            allows: [{
                resources: 'country_to_river',
                permissions: 'delete'
            }]
        },
        /**
         * Model: dog
         */
        {
            roles: 'editor',
            allows: [{
                resources: 'dog',
                permissions: 'create'
            }]
        },
        {
            roles: 'reader',
            allows: [{
                resources: 'dog',
                permissions: 'read'
            }]
        },
        {
            roles: 'editor',
            allows: [{
                resources: 'dog',
                permissions: 'update'
            }]
        },
        {
            roles: 'editor',
            allows: [{
                resources: 'dog',
                permissions: 'delete'
            }]
        },
        /**
         * Model: dog
         */
        {
            roles: 'editor',
            allows: [{
                resources: 'dog',
                permissions: 'create'
            }]
        },
        {
            roles: 'reader',
            allows: [{
                resources: 'dog',
                permissions: 'read'
            }]
        },
        {
            roles: 'editor',
            allows: [{
                resources: 'dog',
                permissions: 'update'
            }]
        },
        {
            roles: 'editor',
            allows: [{
                resources: 'dog',
                permissions: 'delete'
            }]
        },
        /**
         * Model: dog
         */
        {
            roles: 'editor',
            allows: [{
                resources: 'dog',
                permissions: 'create'
            }]
        },
        {
            roles: 'reader',
            allows: [{
                resources: 'dog',
                permissions: 'read'
            }]
        },
        {
            roles: 'editor',
            allows: [{
                resources: 'dog',
                permissions: 'update'
            }]
        },
        {
            roles: 'editor',
            allows: [{
                resources: 'dog',
                permissions: 'delete'
            }]
        },
        /**
         * Model: SequencingExperiment
         */
        {
            roles: 'editor',
            allows: [{
                resources: 'SequencingExperiment',
                permissions: 'create'
            }]
        },
        {
            roles: 'reader',
            allows: [{
                resources: 'SequencingExperiment',
                permissions: 'read'
            }]
        },
        {
            roles: 'editor',
            allows: [{
                resources: 'SequencingExperiment',
                permissions: 'update'
            }]
        },
        {
            roles: 'editor',
            allows: [{
                resources: 'SequencingExperiment',
                permissions: 'delete'
            }]
        },
        /**
         * Model: individual
         */
        {
            roles: 'editor',
            allows: [{
                resources: 'individual',
                permissions: 'create'
            }]
        },
        {
            roles: 'reader',
            allows: [{
                resources: 'individual',
                permissions: 'read'
            }]
        },
        {
            roles: 'editor',
            allows: [{
                resources: 'individual',
                permissions: 'update'
            }]
        },
        {
            roles: 'editor',
            allows: [{
                resources: 'individual',
                permissions: 'delete'
            }]
        },
        /**
         * Model: Location
         */
        {
            roles: 'editor',
            allows: [{
                resources: 'Location',
                permissions: 'create'
            }]
        },
        {
            roles: 'reader',
            allows: [{
                resources: 'Location',
                permissions: 'read'
            }]
        },
        {
            roles: 'editor',
            allows: [{
                resources: 'Location',
                permissions: 'update'
            }]
        },
        {
            roles: 'editor',
            allows: [{
                resources: 'Location',
                permissions: 'delete'
            }]
        },
        /**
         * Model: Measurement
         */
        {
            roles: 'editor',
            allows: [{
                resources: 'Measurement',
                permissions: 'create'
            }]
        },
        {
            roles: 'reader',
            allows: [{
                resources: 'Measurement',
                permissions: 'read'
            }]
        },
        {
            roles: 'editor',
            allows: [{
                resources: 'Measurement',
                permissions: 'update'
            }]
        },
        {
            roles: 'editor',
            allows: [{
                resources: 'Measurement',
                permissions: 'delete'
            }]
        },
        /**
         * Model: parrot
         */
        {
            roles: 'editor',
            allows: [{
                resources: 'parrot',
                permissions: 'create'
            }]
        },
        {
            roles: 'reader',
            allows: [{
                resources: 'parrot',
                permissions: 'read'
            }]
        },
        {
            roles: 'editor',
            allows: [{
                resources: 'parrot',
                permissions: 'update'
            }]
        },
        {
            roles: 'editor',
            allows: [{
                resources: 'parrot',
                permissions: 'delete'
            }]
        },
        /**
         * Model: parrot
         */
        {
            roles: 'editor',
            allows: [{
                resources: 'parrot',
                permissions: 'create'
            }]
        },
        {
            roles: 'reader',
            allows: [{
                resources: 'parrot',
                permissions: 'read'
            }]
        },
        {
            roles: 'editor',
            allows: [{
                resources: 'parrot',
                permissions: 'update'
            }]
        },
        {
            roles: 'editor',
            allows: [{
                resources: 'parrot',
                permissions: 'delete'
            }]
        },
        /**
         * Model: parrot
         */
        {
            roles: 'editor',
            allows: [{
                resources: 'parrot',
                permissions: 'create'
            }]
        },
        {
            roles: 'reader',
            allows: [{
                resources: 'parrot',
                permissions: 'read'
            }]
        },
        {
            roles: 'editor',
            allows: [{
                resources: 'parrot',
                permissions: 'update'
            }]
        },
        {
            roles: 'editor',
            allows: [{
                resources: 'parrot',
                permissions: 'delete'
            }]
        },
        /**
         * Model: person
         */
        {
            roles: 'editor',
            allows: [{
                resources: 'person',
                permissions: 'create'
            }]
        },
        {
            roles: 'reader',
            allows: [{
                resources: 'person',
                permissions: 'read'
            }]
        },
        {
            roles: 'editor',
            allows: [{
                resources: 'person',
                permissions: 'update'
            }]
        },
        {
            roles: 'editor',
            allows: [{
                resources: 'person',
                permissions: 'delete'
            }]
        },
        /**
         * Model: person
         */
        {
            roles: 'editor',
            allows: [{
                resources: 'person',
                permissions: 'create'
            }]
        },
        {
            roles: 'reader',
            allows: [{
                resources: 'person',
                permissions: 'read'
            }]
        },
        {
            roles: 'editor',
            allows: [{
                resources: 'person',
                permissions: 'update'
            }]
        },
        {
            roles: 'editor',
            allows: [{
                resources: 'person',
                permissions: 'delete'
            }]
        },
        /**
         * Model: person
         */
        {
            roles: 'editor',
            allows: [{
                resources: 'person',
                permissions: 'create'
            }]
        },
        {
            roles: 'reader',
            allows: [{
                resources: 'person',
                permissions: 'read'
            }]
        },
        {
            roles: 'editor',
            allows: [{
                resources: 'person',
                permissions: 'update'
            }]
        },
        {
            roles: 'editor',
            allows: [{
                resources: 'person',
                permissions: 'delete'
            }]
        },
        /**
         * Model: river
         */
        {
            roles: 'editor',
            allows: [{
                resources: 'river',
                permissions: 'create'
            }]
        },
        {
            roles: 'reader',
            allows: [{
                resources: 'river',
                permissions: 'read'
            }]
        },
        {
            roles: 'editor',
            allows: [{
                resources: 'river',
                permissions: 'update'
            }]
        },
        {
            roles: 'editor',
            allows: [{
                resources: 'river',
                permissions: 'delete'
            }]
        },
        /**
         * Model: transcript_count
         */
        {
            roles: 'editor',
            allows: [{
                resources: 'transcript_count',
                permissions: 'create'
            }]
        },
        {
            roles: 'reader',
            allows: [{
                resources: 'transcript_count',
                permissions: 'read'
            }]
        },
        {
            roles: 'editor',
            allows: [{
                resources: 'transcript_count',
                permissions: 'update'
            }]
        },
        {
            roles: 'editor',
            allows: [{
                resources: 'transcript_count',
                permissions: 'delete'
            }]
        },

        //adapters
        /**
         * Adapter: dog_instance1
         */
        {
            roles: 'editor',
            allows: [{
                resources: 'dog_instance1',
                permissions: 'create'
            }]
        },
        {
            roles: 'reader',
            allows: [{
                resources: 'dog_instance1',
                permissions: 'read'
            }]
        },
        {
            roles: 'editor',
            allows: [{
                resources: 'dog_instance1',
                permissions: 'update'
            }]
        },
        {
            roles: 'editor',
            allows: [{
                resources: 'dog_instance1',
                permissions: 'delete'
            }]
        },
        /**
         * Adapter: dog_instance2
         */
        {
            roles: 'editor',
            allows: [{
                resources: 'dog_instance2',
                permissions: 'create'
            }]
        },
        {
            roles: 'reader',
            allows: [{
                resources: 'dog_instance2',
                permissions: 'read'
            }]
        },
        {
            roles: 'editor',
            allows: [{
                resources: 'dog_instance2',
                permissions: 'update'
            }]
        },
        {
            roles: 'editor',
            allows: [{
                resources: 'dog_instance2',
                permissions: 'delete'
            }]
        },
        /**
         * Adapter: parrot_instance1
         */
        {
            roles: 'editor',
            allows: [{
                resources: 'parrot_instance1',
                permissions: 'create'
            }]
        },
        {
            roles: 'reader',
            allows: [{
                resources: 'parrot_instance1',
                permissions: 'read'
            }]
        },
        {
            roles: 'editor',
            allows: [{
                resources: 'parrot_instance1',
                permissions: 'update'
            }]
        },
        {
            roles: 'editor',
            allows: [{
                resources: 'parrot_instance1',
                permissions: 'delete'
            }]
        },
        /**
         * Adapter: parrot_instance2
         */
        {
            roles: 'editor',
            allows: [{
                resources: 'parrot_instance2',
                permissions: 'create'
            }]
        },
        {
            roles: 'reader',
            allows: [{
                resources: 'parrot_instance2',
                permissions: 'read'
            }]
        },
        {
            roles: 'editor',
            allows: [{
                resources: 'parrot_instance2',
                permissions: 'update'
            }]
        },
        {
            roles: 'editor',
            allows: [{
                resources: 'parrot_instance2',
                permissions: 'delete'
            }]
        },
        /**
         * Adapter: person_instance1
         */
        {
            roles: 'editor',
            allows: [{
                resources: 'person_instance1',
                permissions: 'create'
            }]
        },
        {
            roles: 'reader',
            allows: [{
                resources: 'person_instance1',
                permissions: 'read'
            }]
        },
        {
            roles: 'editor',
            allows: [{
                resources: 'person_instance1',
                permissions: 'update'
            }]
        },
        {
            roles: 'editor',
            allows: [{
                resources: 'person_instance1',
                permissions: 'delete'
            }]
        },
        /**
         * Adapter: person_instance2
         */
        {
            roles: 'editor',
            allows: [{
                resources: 'person_instance2',
                permissions: 'create'
            }]
        },
        {
            roles: 'reader',
            allows: [{
                resources: 'person_instance2',
                permissions: 'read'
            }]
        },
        {
            roles: 'editor',
            allows: [{
                resources: 'person_instance2',
                permissions: 'update'
            }]
        },
        {
            roles: 'editor',
            allows: [{
                resources: 'person_instance2',
                permissions: 'delete'
            }]
        },
    ]
}