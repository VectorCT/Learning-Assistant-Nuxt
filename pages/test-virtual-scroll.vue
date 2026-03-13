<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h3 mb-4">Virtual Scroll Performance Test</h1>
        
        <v-card class="mb-4">
          <v-card-text>
            <div class="d-flex align-center gap-4">
              <v-text-field
                v-model.number="itemCount"
                label="Number of items"
                type="number"
                min="100"
                max="10000"
                style="max-width: 200px;"
              />
              <v-btn color="primary" @click="generateItems">
                Generate Items
              </v-btn>
              <v-chip color="success">
                {{ items.length }} items loaded
              </v-chip>
            </div>
          </v-card-text>
        </v-card>
        
        <v-tabs v-model="tab" class="mb-4">
          <v-tab value="forums">Forum List</v-tab>
          <v-tab value="questions">Question List</v-tab>
        </v-tabs>
        
        <v-window v-model="tab">
          <v-window-item value="forums">
            <v-card>
              <v-card-title>Virtual Scrolled Forum List</v-card-title>
              <v-card-text>
                <div style="height: 600px;">
                  <VirtualList
                    :items="forumItems"
                    :item-size="120"
                    :buffer="300"
                    key-field="id"
                  >
                    <template #default="{ item: forum, index }">
                      <v-card hover class="mb-3 mx-1">
                        <v-card-title>{{ forum.title }}</v-card-title>
                        <v-card-text>
                          <p class="text-body-2 mb-2">{{ forum.description }}</p>
                          <div class="text-caption text-grey">
                            <v-icon size="small">mdi-account</v-icon>
                            {{ forum.userId }}
                            <v-icon size="small" class="ml-4">mdi-calendar</v-icon>
                            {{ forum.createdAt }}
                            <v-icon size="small" class="ml-4">mdi-comment</v-icon>
                            {{ forum.commentCount }} comments
                          </div>
                        </v-card-text>
                      </v-card>
                    </template>
                  </VirtualList>
                </div>
              </v-card-text>
            </v-card>
          </v-window-item>
          
          <v-window-item value="questions">
            <v-card>
              <v-card-title>Virtual Scrolled Question List</v-card-title>
              <v-card-text>
                <div style="height: 600px;">
                  <VirtualList
                    :items="questionItems"
                    :item-size="100"
                    :buffer="300"
                    key-field="id"
                  >
                    <template #default="{ item: question }">
                      <v-card class="mb-2 mx-1" elevation="1">
                        <v-card-text class="d-flex align-center">
                          <div class="flex-grow-1">
                            <div class="mb-1">
                              <span class="font-weight-medium">Question:</span>
                              {{ question.questionText }}
                            </div>
                            <div class="mb-1">
                              <span class="font-weight-medium">Points:</span>
                              {{ question.pointValue }}
                            </div>
                            <div>
                              <span class="font-weight-medium">Type:</span>
                              {{ question.questionType }}
                            </div>
                          </div>
                          <div class="d-flex ml-4">
                            <v-btn icon="mdi-pencil" size="small" variant="text" />
                            <v-btn icon="mdi-delete" size="small" variant="text" color="error" />
                          </div>
                        </v-card-text>
                      </v-card>
                    </template>
                  </VirtualList>
                </div>
              </v-card-text>
            </v-card>
          </v-window-item>
        </v-window>
        
        <v-card class="mt-4">
          <v-card-title>Performance Notes</v-card-title>
          <v-card-text>
            <ul>
              <li>Virtual scrolling renders only visible items + buffer</li>
              <li>Forum items: 120px height, 300px buffer</li>
              <li>Question items: 100px height, 300px buffer</li>
              <li>Smooth scrolling even with 10,000+ items</li>
              <li>Memory usage remains constant regardless of total items</li>
            </ul>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const tab = ref('forums')
const itemCount = ref(1000)
const items = ref<any[]>([])

const forumItems = computed(() => {
  return items.value.map((item, index) => ({
    id: `forum-${index}`,
    title: `Forum Thread ${index + 1}: ${item.title}`,
    description: item.description,
    userId: `user-${Math.floor(Math.random() * 100)}`,
    createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toLocaleDateString('en-ZA'),
    commentCount: Math.floor(Math.random() * 50)
  }))
})

const questionItems = computed(() => {
  return items.value.map((item, index) => ({
    id: `question-${index}`,
    questionText: `Question ${index + 1}: ${item.title}`,
    pointValue: Math.floor(Math.random() * 10) + 1,
    questionType: Math.random() > 0.5 ? 'Multiple Choice' : 'True/False'
  }))
})

function generateItems() {
  const count = itemCount.value
  items.value = Array.from({ length: count }, (_, i) => ({
    id: i,
    title: generateRandomTitle(),
    description: generateRandomDescription()
  }))
}

function generateRandomTitle() {
  const topics = [
    'Mathematics Problem',
    'Physics Concept',
    'Chemistry Question',
    'Biology Discussion',
    'History Topic',
    'Geography Question',
    'English Literature',
    'Life Sciences',
    'Physical Sciences',
    'Accounting Problem'
  ]
  return topics[Math.floor(Math.random() * topics.length)]
}

function generateRandomDescription() {
  const descriptions = [
    'Need help understanding this concept',
    'Can someone explain this to me?',
    'Looking for study partners',
    'Discussion about exam preparation',
    'Tips and tricks for solving problems',
    'Resource sharing and recommendations',
    'Practice questions and solutions',
    'Study group formation'
  ]
  return descriptions[Math.floor(Math.random() * descriptions.length)]
}

// Generate initial items
generateItems()
</script>
