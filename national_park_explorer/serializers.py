from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import serializers
from .models import CustomUser, Park, Activity, Topic, Address, PhoneNumber, EmailAddress, ParkImage, EntranceFee, EntrancePass, OperatingHours, StandardHours, ExceptionHours, UploadedFile


class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super(MyTokenObtainPairSerializer, cls).get_token(user)
        # Add custom claims
        # E.g. token['username'] = user.username
        return token


class CustomUserSerializer(serializers.ModelSerializer):
    email = serializers.EmailField()
    username = serializers.CharField()
    password = serializers.CharField(min_length=8, write_only=True)

    class Meta:
        model = CustomUser
        fields = ('email', 'username', 'password')
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = self.Meta.model(**validated_data)  # as long as the fields are the same, we can just use this
        if password is not None:
            user.set_password(password)
        user.save()
        return user
    
class ActivitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Activity
        fields = ['id', 'name']


class TopicSerializer(serializers.ModelSerializer):
    class Meta:
        model = Topic
        fields = ['id', 'name']


class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = [
            'line1', 'line2', 'line3',
            'city', 'stateCode', 'countryCode',
            'provinceTerritoryCode', 'postalCode', 'type'
        ]


class PhoneNumberSerializer(serializers.ModelSerializer):
    class Meta:
        model = PhoneNumber
        fields = ['phoneNumber', 'description', 'extension', 'type']


class EmailAddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmailAddress
        fields = ['emailAddress', 'description']


class ParkImageSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField()

    class Meta:
        model = ParkImage
        fields = ['id', 'title', 'altText', 'caption', 'credit', 'url']

    def get_url(self, obj):
        request = self.context.get('request')
        if obj.image and hasattr(obj.image, 'url'):
            return request.build_absolute_uri(obj.image.url)
        return None


class EntranceFeeSerializer(serializers.ModelSerializer):
    class Meta:
        model = EntranceFee
        fields = ['cost', 'description', 'title']


class EntrancePassSerializer(serializers.ModelSerializer):
    class Meta:
        model = EntrancePass
        fields = ['cost', 'description', 'title']


class ExceptionHoursSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExceptionHours
        fields = [
            'name', 'startDate', 'endDate',
            'sunday', 'monday', 'tuesday', 'wednesday',
            'thursday', 'friday', 'saturday'
        ]


class StandardHoursSerializer(serializers.ModelSerializer):
    class Meta:
        model = StandardHours
        fields = [
            'sunday', 'monday', 'tuesday', 'wednesday',
            'thursday', 'friday', 'saturday'
        ]


class OperatingHoursSerializer(serializers.ModelSerializer):
    standardHours = StandardHoursSerializer(source='standard_hours', many=True)
    exceptions = ExceptionHoursSerializer(many=True)

    class Meta:
        model = OperatingHours
        fields = ['name', 'description', 'standardHours', 'exceptions']


class ParkSerializer(serializers.ModelSerializer):
    activities = ActivitySerializer(many=True)
    topics = TopicSerializer(many=True)
    addresses = AddressSerializer(many=True)
    images = ParkImageSerializer(many=True)
    entranceFees = EntranceFeeSerializer(source='entrance_fees', many=True)
    entrancePasses = EntrancePassSerializer(source='entrance_passes', many=True)
    operatingHours = OperatingHoursSerializer(source='operating_hours', many=True)
    contacts = serializers.SerializerMethodField()

    class Meta:
        model = Park
        fields = [
            'id', 'parkCode', 'name', 'fullName', 'description',
            'designation', 'directionsInfo', 'directionsUrl',
            'latLong', 'latitude', 'longitude',
            'states', 'url', 'weatherInfo',
            'activities', 'topics', 'addresses', 'contacts',
            'entranceFees', 'entrancePasses', 'images', 'operatingHours'
        ]

    def get_contacts(self, obj):
        return [{
            'phoneNumbers': PhoneNumberSerializer(obj.phone_numbers.all(), many=True).data,
            'emailAddresses': EmailAddressSerializer(obj.email_addresses.all(), many=True).data,
        }]

class FileUploadSerializer(serializers.ModelSerializer):

    class Meta:
        model = UploadedFile
        fields = ['user', 'file', 'original_filename', 'file_type']
        read_only_fields = ['user', 'original_filename', 'file_type']